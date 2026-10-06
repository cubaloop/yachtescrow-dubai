const crypto = require('crypto');

function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
  const keys = Object.getOwnPropertyNames(obj)
    .filter(k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype')
    .sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}';
}

function hashLeaf(data) {
  return crypto.createHash('sha256').update(canonicalStringify(data)).digest('hex');
}

function hashNodes(left, right) {
  const [first, second] = left < right ? [left, right] : [right, left];
  return crypto.createHash('sha256').update(first + second).digest('hex');
}

class YachtLedger {
  constructor(entries = []) {
    this.entries = entries;
    this.leafHashes = entries.map(hashLeaf);
    this.layers = [];
    this.build();
  }

  build() {
    if (this.leafHashes.length === 0) {
      this.root = crypto.createHash('sha256').update('EMPTY_YACHT_LEDGER').digest('hex');
      this.layers = [[]];
      return;
    }
    let current = [...this.leafHashes];
    this.layers = [current];
    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        if (i + 1 < current.length) next.push(hashNodes(current[i], current[i + 1]));
        else next.push(hashNodes(current[i], current[i]));
      }
      this.layers.push(next);
      current = next;
    }
    this.root = this.layers[this.layers.length - 1][0];
  }

  getRoot() { return this.root; }

  getProof(idx) {
    const proof = [];
    let cur = idx;
    for (let l = 0; l < this.layers.length - 1; l++) {
      const layer = this.layers[l];
      const isRight = cur % 2 === 1;
      const sib = isRight ? cur - 1 : cur + 1;
      if (sib < layer.length) proof.push({ position: isRight ? 'left' : 'right', hash: layer[sib] });
      else proof.push({ position: 'self', hash: layer[cur] });
      cur = Math.floor(cur / 2);
    }
    return proof;
  }

  static verifyProof(leafHash, proof, root) {
    let cur = leafHash;
    for (const step of proof) {
      if (step.position === 'self') cur = hashNodes(cur, cur);
      else if (step.position === 'left') cur = hashNodes(step.hash, cur);
      else cur = hashNodes(cur, step.hash);
    }
    return cur === root;
  }
}

module.exports = { YachtLedger, hashLeaf };

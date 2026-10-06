const assert = require('assert');
const { hashCharterTelemetry, MarineEscrow, YachtLedger, hashLeaf } = require('../app/core');

console.log('--- RUNNING YACHTESCROW UNIT TESTS ---');
let passed = 0; let failed = 0;
function it(desc, fn) {
  try { fn(); passed++; console.log(`  ✓ ${desc}`); }
  catch(e) { failed++; console.error(`  ✗ ${desc}:`, e.message); }
}

it('MarineEngine: Hashes charter telemetry deterministically', () => {
  const t = { vesselId: 'MAJESTY-120', charterId: 'CH-1', durationHours: 6, fuelConsumedLitres: 450 };
  const h1 = hashCharterTelemetry(t);
  const h2 = hashCharterTelemetry(t);
  assert.strictEqual(h1.telemetryHash, h2.telemetryHash);
});

it('MarineEscrow: Conserves fuel deposit funds with cryptographic settlement proof', () => {
  const escrow = new MarineEscrow('CH-100', 35000, 15000);
  assert.strictEqual(escrow.verifyConservation(), true);
  const s = escrow.settleCharter(11200, 'TELEMETRY_PROOF');
  assert.strictEqual(s.fuelSettledAed, 11200);
  assert.strictEqual(s.fuelRefundedAed, 3800);
  assert.strictEqual(escrow.verifyConservation(), true);
  assert.strictEqual(typeof s.settlementProof, 'string');
});

it('YachtLedger: Generates and validates Merkle inclusion proofs for superyacht fleet', () => {
  const charters = [
    { vessel: 'Benetti 50M', charterer: 'Elena R.', aed: 95000 },
    { vessel: 'Sunseeker 88', charterer: 'Tariq N.', aed: 45000 }
  ];
  const ledger = new YachtLedger(charters);
  for (let i = 0; i < charters.length; i++) {
    const leaf = hashLeaf(charters[i]);
    const proof = ledger.getProof(i);
    assert.strictEqual(YachtLedger.verifyProof(leaf, proof, ledger.getRoot()), true);
  }
});

console.log(`\nYACHTESCROW UNIT TESTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

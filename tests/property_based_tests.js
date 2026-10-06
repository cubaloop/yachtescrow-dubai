const fc = require('fast-check');
const { MarineEscrow, YachtLedger, hashLeaf } = require('../app/core');

console.log('--- RUNNING YACHTESCROW PROPERTY-BASED TESTS (5,000 INVARIANTS) ---');

console.log('Testing Property 1: Marine Fuel Escrow Conservation Invariant...');
fc.assert(
  fc.property(
    fc.integer({ min: 5000, max: 200000 }), // Base charter AED
    fc.integer({ min: 1000, max: 50000 }),  // Fuel deposit AED
    fc.integer({ min: 0, max: 70000 }),     // Actual fuel cost AED
    (base, deposit, actualCost) => {
      const escrow = new MarineEscrow('CH-FC', base, deposit);
      const s = escrow.settleCharter(actualCost, 'HASH');
      const conserved = (s.fuelSettledAed + s.fuelRefundedAed) === deposit;
      const nonNegative = s.fuelSettledAed >= 0 && s.fuelRefundedAed >= 0;
      return conserved && nonNegative && escrow.verifyConservation();
    }
  ),
  { numRuns: 2500 }
);
console.log('  ✓ Property 1 PASSED (2,500 runs)');

console.log('Testing Property 2: YachtLedger Merkle Inclusion & Tamper Resistance...');
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        vessel: fc.string({ minLength: 2, maxLength: 20 }),
        hours: fc.integer({ min: 2, max: 48 }),
        aed: fc.integer({ min: 5000, max: 500000 })
      }),
      { minLength: 2, maxLength: 16 }
    ),
    fc.nat(),
    (vessels, targetRaw) => {
      const targetIdx = targetRaw % vessels.length;
      const ledger = new YachtLedger(vessels);
      const root = ledger.getRoot();

      const authentic = hashLeaf(vessels[targetIdx]);
      const proof = ledger.getProof(targetIdx);
      const valid = YachtLedger.verifyProof(authentic, proof, root);
      if (!valid) return false;

      const tampered = hashLeaf({ ...vessels[targetIdx], aed: vessels[targetIdx].aed + 1 });
      return YachtLedger.verifyProof(tampered, proof, root) === false;
    }
  ),
  { numRuns: 2500 }
);
console.log('  ✓ Property 2 PASSED (2,500 runs)');

console.log('\n--- ALL 5,000 YACHTESCROW PROPERTY-BASED TESTS PASSED WITH 100% SUCCESS ---');

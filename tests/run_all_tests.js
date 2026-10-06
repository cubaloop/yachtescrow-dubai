const { execSync } = require('child_process');

console.log('====================================================');
console.log('   YACHTESCROW: EXTENSIVE TEST SUITE RUNNER         ');
console.log('====================================================\n');

try {
  execSync('node tests/unit_tests.js', { stdio: 'inherit' });
  execSync('node tests/property_based_tests.js', { stdio: 'inherit' });
  console.log('\n  ✓ ALL YACHTESCROW TESTS PASSED 100%');
} catch(e) {
  process.exit(1);
}

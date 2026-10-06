const marine = require('./marineEngine');
const ledger = require('./yachtLedger');

module.exports = { ...marine, ...ledger };

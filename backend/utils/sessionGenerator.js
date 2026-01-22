const crypto = require('crypto');

function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = generateSessionId
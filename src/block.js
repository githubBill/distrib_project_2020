const hash = require('object-hash');

module.exports = class BLOCK {
    index;
    timestamp;
    transactions;
    nonce;
    current_hash;
    previous_hash;
    constructor(index, nonce, previous_hash) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = [];
        this.nonce = nonce;
        this.current_hash = this.hashBlock();
        this.previous_hash = previous_hash;
    }

    hashBlock() {
        var blockdata = {
            index:          this.index,
            timestamp:      this.timestamp,
            transactions:   this.transactions,
            nonce:          this.nonce
        }
        return hash(blockdata);
    }
}
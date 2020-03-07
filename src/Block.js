const hash = require('object-hash');

class Block {
    index;
    timestamp;
    transactions;
    nonce;
    previous_hash;
    current_hash;
    constructor(index, nonce, previous_hash) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = [];
        this.nonce = nonce;
        this.previous_hash = previous_hash;
        this.current_hash = this.hashBlock();
    }

    hashBlock() {
        let blockdata = {
            index:          this.index,
            timestamp:      this.timestamp,
            transactions:   this.transactions,
            nonce:          this.nonce,
            previous_hash:  this.previous_hash
        }
        return hash(blockdata);
    }
}

module.exports = Block;
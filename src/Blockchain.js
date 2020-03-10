const hash = require('object-hash');

class Block {
    constructor(index, nonce, previous_hash) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = [];
        this.nonce = nonce;
        this.previous_hash = previous_hash;
        this.current_hash = this.hashBlock();
        Object.seal(this);
    }

    hashBlock() {
        let blockdata = {
            index:          this.index,
            timestamp:      this.timestamp,
            transactions:   this.transactions,
            nonce:          this.nonce,
            previous_hash:  this.previous_hash
        };
        return hash(blockdata);
    }
}

class Blockchain {
    constructor() {
        this.chain = [Blockchain.createBlock(0, 0, 1)];
        Object.seal(this);
    }

    static createBlock(index, nonce, previous_hash) {
        return new Block(index, nonce, previous_hash);
    }

    getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) {
		newBlock.previous_hash = this.getLatestBlock().current_hash;
		newBlock.current_hash = newBlock.hashBlock();
		this.chain.push(newBlock);
	}

	isChainValid() {
		for (let i = 1; i < this.chain.length; i++){
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (currentBlock.current_hash !== currentBlock.hashBlock()) {
				return false;
			}

			if (currentBlock.previous_hash !== previousBlock.current_hash) {
				return false;
			}
		}
		return true;
    }

    // for debugging
    getProperties() {
        let properties = {
            chain:      this.chain,
            lastBlock:  this.getLatestBlock(),
            valid:      this.isChainValid()
        };
        return properties;
    }
}

module.exports = Blockchain;
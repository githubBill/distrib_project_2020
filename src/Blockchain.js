"use strict";

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

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.current_hash = this.hashBlock();
        }
        console.log("BLOCK MINED: " + this.hash);
    }
}

class Blockchain {
    constructor(capacity, difficulty) {
        this.chain = [Blockchain.createBlock(0, 0, 1)];
        this.capacity = capacity;
        this.difficulty = difficulty;
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
		newBlock.mineBlock(this.difficulty);
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
            capacity:   this.capacity,
            difficulty: this.difficulty,
            lastBlock:  this.getLatestBlock(),
            valid:      this.isChainValid()
        };
        return properties;
    }
}

module.exports = Blockchain;
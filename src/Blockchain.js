"use strict";

const hash = require('object-hash');

/**
 * @class Block
 */
class Block {

    /**
     *Creates an instance of Block.
     * @param {*} index
     * @param {*} nonce
     * @param {*} previous_hash
     * @memberof Block
     */
    constructor(index, nonce, previous_hash) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = [];
        this.nonce = nonce;
        this.previous_hash = previous_hash;
        this.current_hash = this.hashBlock();
        Object.seal(this);
    }


    /**
     * @returns {object}
     * @memberof Block
     */
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


    /**
     * @param {number} difficulty
     * @memberof Block
     */
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.current_hash = this.hashBlock();
        }
        console.log("BLOCK MINED: " + this.hash);
    }
}

class Blockchain {

    /**
     *Creates an instance of Blockchain.
     * @param {number} capacity
     * @param {number} difficulty
     * @memberof Blockchain
     */
    constructor(capacity, difficulty) {
        this.chain = [Blockchain.createBlock(0, 0, 1)];
        this.capacity = capacity;
        this.difficulty = difficulty;
        Object.seal(this);
    }


    /**
     * @static
     * @param {number} index
     * @param {number} nonce
     * @param {string} previous_hash
     * @returns {Block}
     * @memberof Blockchain
     */
    static createBlock(index, nonce, previous_hash) {
        return new Block(index, nonce, previous_hash);
    }


    /**
     * @returns {Block[]}
     * @memberof Blockchain
     */
    getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

    /**
     * @param {Block} newBlock
     * @memberof Blockchain
     */
    addBlock(newBlock) {
		newBlock.previous_hash = this.getLatestBlock().current_hash;
		newBlock.mineBlock(this.difficulty);
		this.chain.push(newBlock);
    }

    /**
     * @param {*} newTransaction
     * @memberof Blockchain
     */
    addTransaction(newTransaction) {
        let last_block =  this.getLatestBlock();
        last_block.transactions.push(newTransaction);
        if (last_block.transactions.length == this.capacity) {
            console.log("block is full");
        }
    }

    /**
     * @returns {boolean}
     * @memberof Blockchain
     */
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
    /**
     * @returns {object}
     * @memberof Blockchain
     */
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
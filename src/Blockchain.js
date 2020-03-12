"use strict";

const Block = require("./Block");

/** @class Blockchain */
class Blockchain {
    /**
     *Creates an instance of Blockchain.
     * @memberof Blockchain
     * @property {object[]} chain
     * @property {number} capacity
     * @property {number} difficulty
     */
    constructor() {
        /** @type {object[]} */
        this.chain = [];
        /** @type {number} */
        this.capacity = 0;
        /** @type {number} */
        this.difficulty = 0;
        Object.seal(this);
    }

    /**
     * @param {number} capacity
     * @param {number} difficulty
     * @memberof Blockchain
     */
    init(capacity, difficulty) {
        this.chain = [Blockchain.createBlock(0, 0, 1)];
        this.capacity = capacity;
        this.difficulty = difficulty;
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
        let myblock = new Block();
        myblock.init(index, nonce, previous_hash);
        return myblock;
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

			if (currentBlock.current_hash !== currentBlock.calculateHash()) {
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
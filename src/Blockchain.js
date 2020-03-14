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
        let genesisblock = new Block();
        genesisblock.init(0, 0, 1);
        this.chain = [genesisblock];
        this.capacity = capacity;
        this.difficulty = difficulty;
    }

    /**
     *import plain javascript object to Transaction instance
     * @param {object} obj
     * @memberof Blockchain
     */
    import(obj) {
        Object.assign(this, obj);
        this.chain = [];
        obj.chain.forEach((block) => {
            let block_instance = new Block();
            block_instance.import(block);
            this.chain.push(block_instance);
        });
    }

    /**
     * @returns {Block}
     * @memberof Blockchain
     */
    getLatestBlock() {
		return this.chain[this.chain.length - 1];
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
            difficulty: this.difficulty
        };
        return properties;
    }
}

module.exports = Blockchain;
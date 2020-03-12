"use strict";

const hash = require('object-hash');

const Transaction = require("./Transaction");

/** @class Block */
class Block {
    /**
     *Creates an instance of Block.
     * @memberof Block
     * @property {number} index
     * @property {number} timestamp
     * @property {Transaction[]} transactions
     * @property {number} nonce
     * @property {string} previous_hash
     * @property {string} current_hash
     */
    constructor() {
        /** @type {number} */
        this.index = null;
        /** @type {number} */
        this.timestamp = null;
        /** @type {Transaction[]} */
        this.transactions = [];
        /** @type {number} */
        this.nonce = null;
        /** @type {string} */
        this.previous_hash = "";
        /** @type {string} */
        this.current_hash = "";
        Object.seal(this);
    }

    /**
     * @param {number} index
     * @param {number} nonce
     * @param {string} previous_hash
     * @memberof Block
     */
    init(index, nonce, previous_hash) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = [];
        this.nonce = nonce;
        this.previous_hash = previous_hash;
        this.current_hash = this.calculateHash();
    }

    /**
     * @returns {string}
     * @memberof Block
     */
    calculateHash() {
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
            this.current_hash = this.calculateHash();
        }
        console.log("BLOCK MINED: " + this.hash);
    }
}

module.exports = Block;
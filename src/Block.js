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
     *import plain javascript object to Block instance
     * @param {object} obj
     * @memberof Block
     */
    import(obj) {
        Object.assign(this, obj);
        this.transactions = [];
        obj.transactions.forEach((transaction) => {
            let transaction_instance = new Transaction();
            transaction_instance.import(transaction);
            this.transactions.push(transaction_instance);
        });
    }

    /**
     * @returns {string}
     * @memberof Block
     */
    calculateHash() {
        let blockdata = {
            index:          this.index,
            timestamp:      this.timestamp,
            nonce:          this.nonce,
            previous_hash:  this.previous_hash
        };
        return hash(blockdata);
    }

    /**
     * @param {string} received_previoushash
     * @returns {boolean}
     * @memberof Block
     */
    isValidated(received_previoushash) {
        let check = true;
        if (this.current_hash != this.calculateHash() ||
            this.previous_hash != received_previoushash) {
            check = false;
        }
        return check;
    }
}

module.exports = Block;
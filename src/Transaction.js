"use strict";

const hash = require('object-hash');
const jwa = require('jwa');

/** @class Transaction */
class Transaction {
    /**
     *Creates an instance of Transaction.
     * @memberof Transaction
     * @property {string} sender_address
     * @property {string} receiver_address
     * @property {number} amount
     * @property {Transaction[]} transaction_inputs
     * @property {object[]} transaction_outputs
     * @property {string} transaction_id
     * @property {string} signature
     */
    constructor() {
        /** @type {string} */
        this.sender_address = null;
        /** @type {string} */
        this.receiver_address = null;
        /** @type {number} */
        this.amount = null;
        /** @type {Transaction[]} */
        this.transaction_inputs = [];
        /** @type {string} */
        this.transaction_id = "0";
        /** @type {object[]} */
        this.transaction_outputs = [];
        /** @type {string} */
        this.signature = null;
        Object.seal(this);
    }

    /**
     * @param {string} privatekey
     * @param {string} sender_address
     * @param {string} receiver_address
     * @param {number} amount
     * @param {object[]} transaction_inputs
     * @memberof Transaction
     */
    init(privatekey, sender_address, receiver_address, amount, transaction_inputs) {
        this.sender_address = sender_address;
        this.receiver_address = receiver_address;
        this.amount = amount;
        this.transaction_inputs = transaction_inputs;
        this.transaction_id = this.hashTransaction();
        this.transaction_outputs = new Array(2);

        this.transaction_outputs[0] = {
            id: this.transaction_id,
            recipient: this.receiver_address,
            amount: this.amount
        };
        this.transaction_outputs[1] = {
            id: this.transaction_id,
            recipient: this.sender_address,
            amount: -this.amount
        };
        this.signature = this.signTransaction(privatekey);
    }

    /**
     *import plain javascript object to Transaction instance
     * @param {object} obj
     * @memberof Transaction
     */
    import(obj) {
        Object.assign(this, obj);
    }

    /**
     * @returns {string}
     * @memberof Transaction
     */
    hashTransaction() {
        let transctiondata = {
            sender_address:         this.sender_address,
            receiver_address:       this.receiver_address,
            amount:                 this.amount,
            transaction_inputs:     this.transaction_inputs
        };
        return hash(transctiondata);
    }

    /**
     * @param {string} privatekey
     * @returns {string}
     * @memberof Transaction
     */
    signTransaction (privatekey){
        const rsa_sign = jwa('RS256');
        let transctiondata = {
            sender_address:         this.sender_address,
            receiver_address:       this.receiver_address,
            amount:                 this.amount,
            transaction_inputs:     this.transaction_inputs,
            transaction_outputs:    this.transaction_outputs,
            transaction_id:         this.transaction_id
        };
        transctiondata = JSON.stringify(transctiondata);
        return rsa_sign.sign(transctiondata,privatekey);
    }

    /**
     * @returns {boolean}
     * @memberof Transaction
     */
    isSignatureVerified () {
        const rsa_sign = jwa('RS256');
        let transctiondata = {
            sender_address:         this.sender_address,
            receiver_address:       this.receiver_address,
            amount:                 this.amount,
            transaction_inputs:     this.transaction_inputs,
            transaction_outputs:    this.transaction_outputs,
            transaction_id:         this.transaction_id
        };
        transctiondata = JSON.stringify(transctiondata);
        return rsa_sign.verify(transctiondata, this.signature, this.sender_address);
    }

    /**
     * @returns {boolean}
     * @memberof Transaction
     */
    isTransactionValid () {
        let transctiondata = {
            sender_address:         this.sender_address,
            receiver_address:       this.receiver_address,
            amount:                 this.amount,
            transaction_inputs:     this.transaction_inputs
        };
        let check = true;
        if (hash(transctiondata) != this.transaction_id) {
            check = false;
        }

        let nbc_remaining = 0;
        for (let i=this.transaction_inputs.length-1; i>=0; i--) {
            nbc_remaining += this.transaction_inputs[i].amount;
        }
        nbc_remaining -= this.amount;
        //if (this.transaction_outputs[1].amount < 0) {
        if (nbc_remaining < 0) {
            check = false;
        }
        return check;
    }
}

module.exports = Transaction;
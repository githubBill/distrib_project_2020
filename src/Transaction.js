"use strict";

const hash = require('object-hash');
const jwa = require('jwa');

/**
 * @class Transaction
 * @property {string} sender_address
 * @property {string} receiver_address
 * @property {number} amount
 * @property {object[]} transaction_inputs
 * @property {object[]} transaction_outputs
 * @property {string} transaction_id
 * @property {string} signature
 */
class Transaction {
    /**
     *Creates an instance of Transaction.
     * @memberof Transaction
     */
    constructor() {
        this.sender_address = null;
        this.receiver_address = null;
        this.amount = null;
        this.transaction_inputs = [];
        this.transaction_id = "0";
        this.transaction_outputs = [];
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
    create(privatekey, sender_address, receiver_address, amount, transaction_inputs) {
        this.sender_address = sender_address;
        this.receiver_address = receiver_address;
        this.amount = amount;
        this.transaction_inputs = transaction_inputs;
        this.transaction_id = this.hashTransaction();
        this.transaction_outputs = new Array(2);

        let nbc_remaining = 0;
        for (let i=this.transaction_inputs.length-1; i>=0; i--) {
            nbc_remaining += this.transaction_inputs[i].amount;
        }
        nbc_remaining -= this.amount;
        console.log(this.transaction_inputs);
        console.log("nbc_remaining ", nbc_remaining);
        this.transaction_outputs[0] = {
            id: this.transaction_id,
            recipient: this.receiver_address,
            amount: this.amount
        };
        this.transaction_outputs[1] = {
            id: this.transaction_id,
            recipient: this.sender_address,
            amount: nbc_remaining
        };
        this.signature = this.signTransaction(privatekey);
    }

    /**
     * @param {object} obj plain javascript object
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
        let check = false;
        if (hash(transctiondata) == this.transaction_id) {
            check = true;
        }
        return check;
    }

}

module.exports = Transaction;
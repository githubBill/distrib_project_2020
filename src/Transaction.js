"use strict";

const hash = require('object-hash');
const jwa = require('jwa');

class Transaction {
    constructor(sender_address, receiver_address, amount, privatekey) {
        this.sender_address = sender_address;
        this.receiver_address = receiver_address;
        this.amount = amount;
        this.transaction_inputs = [];
        this.transaction_outputs = [];
        this.transaction_id = this.hashTransaction();
        this.signature = this.signTransaction(privatekey);
        Object.seal(this);
    }

    hashTransaction() {
        let transctiondata = {
            sender_address:         this.sender_address,
            receiver_address:       this.receiver_address,
            amount:                 this.amount,
            transaction_inputs:     this.transaction_inputs,
            transaction_outputs:    this.transaction_outputs
        };
        return hash(transctiondata);
    }

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
}

module.exports = Transaction;
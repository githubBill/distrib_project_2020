"use strict";

class Transaction {
    constructor(node) {
        this.sender_address = null;
        this.receiver_address = null;
        this.amount;
        this.transaction_id = null;
        this.transaction_inputs = [];
        this.transaction_outputs = [];
        this.signature = null;
        Object.seal(this);
    }
}

module.exports = Transaction;
"use strict";

const axios = require('axios').default;

const Wallet = require("./Wallet");
const Blockchain = require("./Blockchain");
const Transaction = require("./Transaction");
const Rest = require("./Rest");
const Block = require("./Block");

/** @class Node */
class Node {
    /**
     *Creates an instance of Node.
     * @memberof Node
     * @property {string} ip
     * @property {number} port
     * @property {number} id
     * @property {number} n
     * @property {Wallet} wallet
     * @property {object[]} contacts
     * @property {number} received_contacts
     * @property {Blockchain} blockchain
     * @property {Rest} rest
     * @property {object[]} pending_transactions
     */
    constructor() {
        /** @type {string} */
        this.ip = "";
        /** @type {number} */
        this.port = 0;
        /** @type {number} */
        this.id = 0;
        /** @type {number} */
        this.n = 0;
        /** @type {Wallet} */
        this.wallet = new Wallet();
        /** @type {object[]} */
        this.contacts = [];
        /** @type {number} */
        this.received_contacts = 1;
        /** @type {Blockchain} */
        this.blockchain = new Blockchain();
        /** @type {Rest} */
        this.rest = new Rest(this);
        /** @type {object[]} */
        this.pending_transactions = [];
        this.finished_transactions = true;
        Object.seal(this);
    }

    /**
     * @param {string} bootstrap_ip
     * @param {number} bootstrap_port
     * @param {string} ip
     * @param {number} id
     * @param {number} n
     * @param {number} capacity
     * @param {number} difficulty
     * @memberof Node
     */
    init(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port+id;
        this.id = id;
        this.n = n;
        this.wallet.init();
        this.contacts = new Array(n);
        this.received_contacts = 1;
        this.contacts[0] = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null,
            UTXO:   []
        };
        this.contacts[this.id] = {
            ip:   this.ip,
            port: this.port,
            publickey: this.wallet.publickey,
            UTXO:   []
        };
        this.blockchain.init(capacity, difficulty);
        this.rest.init();
    }

    //
    /**
     *send contact info to bootstrap node
     * @memberof Node
     */
    sendContact() {
        if (this.id != 0) {
            let url = "http://" + this.contacts[0].ip + ":" + this.contacts[0].port + "/backend/newnode";
            axios.post(url, {
                id:             this.id,
                contact_info:   this.contacts[this.id]
            });
        }
    }

    /**
     * @param {object[]} contacts
     * @param {string} contacts[].ip
     * @param {number} contacts[].port
     * @param {string} contacts[].publickey
     * @memberof Node
     */
    action_receivecontacts(contacts) {
        console.log('I am Node' + this.id + ". Updating my contacts");
        this.contacts = JSON.parse(JSON.stringify(contacts));
        this.received_contacts = this.contacts.length;
    }

    /**
     * @param {Blockchain} blockchain
     * @memberof Node
     */
    action_receiveblockchain(blockchain) {
        if (this.blockchain.isChainValid()) {
            console.log('I am Node' + this.id + ". Updating my Blockchain");
            this.blockchain.import(blockchain);
        } else {
            console.log('I am Node' + this.id + ". Received Blockchain is not valid");
        }
    }

    /**
     * @param {string} receiver_address
     * @param {number} amount
     * @memberof Node
     */
    create_transaction(receiver_address, amount) {
        let transaction = new Transaction();
        transaction.init(this.wallet.privatekey, this.wallet.publickey, receiver_address, amount, this.contacts[this.id].UTXO.slice());
        this.broadcast_transaction(transaction);
    }
    /**
     * @param {Transaction} transaction
     * @memberof Node
     */
    broadcast_transaction(transaction) {
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {       // other nodes
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivetransaction";
                axioses.push(axios.post(url, {
                    transaction:   transaction
                }));
            }
        }
        Promise.all(axioses);
        this.action_receivetransction(transaction);  // self
    }

    /**
     * @param {object} received_transaction
     * @memberof Node
     */
    action_receivetransction(received_transaction) {
        console.log('I am Node' + this.id + ". Received Trabsaction");
        let transaction = new Transaction();
        transaction.import(received_transaction);
        this.pending_transactions.push(transaction);
        if (this.finished_transactions == true) {
            this.execute_pending_transactions();
        }
    }

    /**
     * @memberof Node
     */
    execute_pending_transactions() {
        if (this.pending_transactions.length > 0) {
            this.finished_transactions = false;
            let transaction = this.pending_transactions.shift();
            this.execute_transaction(transaction);
            this.execute_pending_transactions();
        } else {
            this.finished_transactions = true;
        }
    }

    /**
     * @param {Transaction} transaction
     * @memberof Node
     */
    execute_transaction(transaction) {
        let receiver_i = this.contacts.findIndex(i => i.publickey === transaction.transaction_outputs[0].recipient);
        let sender_i = this.contacts.findIndex(i => i.publickey === transaction.transaction_outputs[1].recipient);
        console.log('I am Node' + this.id + ". Executing Trabsaction from node" + sender_i + " to node" + receiver_i);
        if (transaction.isSignatureVerified() && transaction.isTransactionValid()) {
            console.log('I am Node' + this.id + ". Transaction verified and validated");
            // add transaction to block
            let last_block =  this.blockchain.getLatestBlock();
            last_block.transactions.push(transaction);
            // update UTXOs
            this.contacts[receiver_i].UTXO.push(transaction.transaction_outputs[0]);
            this.contacts[sender_i].UTXO = [];
            this.contacts[sender_i].UTXO.push(transaction.transaction_outputs[1]);
            // mine new block if last_block is full
            if (last_block.transactions.length == this.blockchain.capacity) {
                this.mine_block();
            }
        } else {
            console.log('I am Node' + this.id + ". Transaction is not valid");
        }
    }

    /**
     * @memberof Node
     */
    mine_block() {
        console.log('I am Node' + this.id + ". Mining block");
        let newblock = new Block();
        newblock.init(this.blockchain.getLatestBlock().index+1, 0, this.blockchain.getLatestBlock().current_hash);
        newblock.mineBlock(this.blockchain.difficulty);
        // broadcast block only if it hasn't received any during mining
        if (newblock.isValidated(this.blockchain.getLatestBlock().current_hash)) {
            this.broadcast_block(newblock);
        }
    }

    /**
     * @param {Block} newblock
     * @memberof Node
     */
    broadcast_block(newblock) {
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {   // other nodes
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receiveblock";
                axioses.push(axios.post(url, {
                    block:   newblock
                }));
            }
        }
        Promise.all(axioses);
        this.action_receiveblock(newblock);  // self
    }

    /**
     * @param {object} received_block
     * @memberof Node
     */
    action_receiveblock(received_block) {
        let newblock = new Block();
        newblock.import(received_block);
        if (newblock.index == this.blockchain.getLatestBlock().index+1) {   // accept only first received block of mining
            if (newblock.isValidated(this.blockchain.getLatestBlock().current_hash)) {
                console.log('I am Node' + this.id + ". Adding block with index " + newblock.index + " and current_hash " + newblock.current_hash);
                this.blockchain.chain.push(newblock);
            } else {
                this.resolve_conflict();
            }
        }
    }

    /**
     * @memberof Node
     */
    resolve_conflict() {
        console.log('I am Node' + this.id + ". Resolving conflict");
        for (let id=0; id < this.contacts.length; id++) {
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/askedblockchain";
                axios.post(url, {
                    blockchain:   this.blockchain
                }).then((response) => {
                    console.log("new blockchain " + JSON.stringify(response.data.chain[response.data.chain.length-1]));
                    if (response.data.length >= this.blockchain.chain.length) {
                        this.blockchain.import(response.data);
                    }
                });
            }
        }
    }

    /**
     * @returns {object}
     * @memberof Node
     */
    view_last_transactions() {
        return this.blockchain.getLatestBlock().transactions;
    }

    /**
     * @returns {number}
     * @memberof Node
     */
    show_balance() {
        let balance = 0;
        this.contacts[this.id].UTXO.forEach((unspent_transaction) => {
            balance += unspent_transaction.amount;
        });
        return balance;
    }

    /**
     *for debugging
     * @returns {object}
     * @memberof Node
     */
    getProperties() {
        let properties = {
            ip:             this.ip,
            port:           this.port,
            id:             this.id,
            n:              this.n,
            wallet:         this.wallet.getProperties(),
            contacts:       this.contacts,
            blockchain:     this.blockchain.getProperties()
        };
        return properties;
    }
}

module.exports = Node;
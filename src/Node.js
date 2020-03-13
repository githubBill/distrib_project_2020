"use strict";

const axios = require('axios').default;

const Wallet = require("./Wallet");
const Blockchain = require("./Blockchain");
const Transaction = require("./Transaction");
const Rest = require("./Rest");

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
            }
            );
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
            this.blockchain.chain = blockchain.chain;
        } else {
            console.log('I am Node' + this.id + ". Received Blockchain is not valid");
        }
    }

    /**
     * @param {object} received_transaction
     * @memberof Node
     */
    action_receivetransction(received_transaction) {
        let transaction = new Transaction();
        transaction.import(received_transaction);
        if (transaction.isSignatureVerified() && transaction.isTransactionValid()) {
            console.log('I am Node' + this.id + ". Transaction verified and validated");
            this.blockchain.addTransaction(transaction);
            // update UTXOs
            let receiver_i = this.contacts.findIndex(i => i.publickey === transaction.transaction_outputs[0].recipient);
            this.contacts[receiver_i].UTXO.push(transaction.transaction_outputs[0]);
            let sender_contact = this.contacts.find(contact => contact.publickey === transaction.transaction_outputs[1].recipient);
            sender_contact.UTXO = [];
            sender_contact.UTXO.push(transaction.transaction_outputs[1]);
        } else {
            console.log('I am Node' + this.id + ". Transaction is not valid");
        }
    }

    /**
     * @param {string} receiver_address
     * @param {number} amount
     * @memberof Node
     */
    client_doTransaction(receiver_address, amount) {
        let mytransaction = new Transaction();
        mytransaction.init(this.wallet.privatekey, this.wallet.publickey, receiver_address, amount, this.contacts[this.id].UTXO.slice());
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {
            if (id == this.id) {    // self
                this.action_receivetransction(mytransaction);
            } else {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivetransaction";
                axioses.push(axios.post(url, {
                    transaction:   mytransaction
                }));
            }
        }
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
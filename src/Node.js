"use strict";

const axios = require('axios').default;

const Wallet = require("./Wallet");
const Blockchain = require("./Blockchain");
const Transaction = require("./Transaction");

const Rest = require("./Rest");

class Node {
    /**
     *Creates an instance of Node.
     * @param {string} bootstrap_ip
     * @param {number} bootstrap_port
     * @param {string} ip
     * @param {number} id
     * @param {number} n
     * @param {number} capacity
     * @param {number} difficulty
     * @memberof Node
     */
    constructor(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port + id;
        this.id = id;
        this.n = n;
        this.wallet = new Wallet();
        this.wallet.init();
        let bootstrap_contact = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null,
            UTXO:   []
        };
        this.rest = new Rest(this);
        this.contacts = new Array(n);
        this.received_contacts = 1;
        this.contacts[0] = bootstrap_contact;
        this.blockchain = new Blockchain(capacity, difficulty);
        Object.seal(this);
    }

    // complex initialization should be outside of constructor
    /**
     * @memberof Node
     */
    init() {
        this.rest.init();
        // if it's the bootstrap node
        if (this.id == 0) {
            this.contacts[0].publickey = this.wallet.publickey;
            let first_transaction = new Transaction();
            first_transaction.init(this.wallet.privatekey, 0, this.wallet.publickey, 100*this.n, this.contacts[this.id].UTXO.slice());
            this.blockchain.addTransaction(first_transaction);
            this.contacts[0].UTXO.push(first_transaction.transaction_outputs[0]);
        }
    }

    /**
     *Is called when restapp is ready
     * @memberof Node
     */
    start() {
        if (this.id != 0) {
            this.sendContact();
        }
    }

    // send contact info to bootstrap node
    /**
     * @memberof Node
     */
    sendContact() {
        let url = "http://" + this.contacts[0].ip + ":" + this.contacts[0].port + "/backend/newnode";
        axios.post(url, {
            id:             this.id,
            contact_info:   {
                ip:         this.ip,
                port:       this.port,
                publickey:  this.wallet.publickey,
                UTXO:       []
            }
        }
        );
    }

    // only on bootstrap node
    // add contact to position id and update contact at all node when completed
    /**
     * @param {number} id
     * @param {object} contact_info
     * @param {string} contact_info.ip
     * @param {number} contact_info.port
     * @param {string} contact_info.publickey
     * @param {object} contact_info.UTXO
     * @memberof Node
     */
    action_receivecontact (id, contact_info) {
        this.received_contacts += 1;
        this.contacts[id] = JSON.parse(JSON.stringify(contact_info));
        // when all nodes are active
        if (this.received_contacts == this.n) {
            this.broadcastContacts();
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
    action_receiveblockchain(blockchain) {
        if (this.blockchain.isChainValid()) {
            console.log('I am Node' + this.id + ". Updating my Blockchain");
            this.blockchain.chain = blockchain.chain;
        } else {
            console.log('I am Node' + this.id + ". Received Blockchain is not valid");
        }
    }
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

    broadcastContacts() {
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivecontacts";
                axioses.push(axios.post(url, {
                    contacts:   this.contacts
                }));
        }
        Promise.all(axioses).then((responses) => {
            console.log("AXIOS ", this.contacts[0].UTXO);
            this.broadcastBlockchain();
        }).catch((err) => {
            console.log(err);
        });
    }
    broadcastBlockchain() {
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receiveblockchain";
                axioses.push(axios.post(url, {
                    blockchain:   this.blockchain
                }));
            }
        }
        Promise.all(axioses).then((responses) => {
            this.initialTransactions();
        }).catch((err) => {
            console.log(err);
        });
    }
    initialTransactions() {
        for (let i=1; i < this.contacts.length; i++) {
            this.createaBroadcastTransaction(this.contacts[i].publickey, 100);
        }
    }

    createaBroadcastTransaction(receiver_address, amount) {
        console.log("I am node" + this.id + ". I am creating a transaction", this.contacts[this.id].UTXO.slice());
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

    // for debugging
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
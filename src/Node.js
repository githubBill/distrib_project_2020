"use strict";

const axios = require('axios').default;

const Wallet = require("./Wallet");
const Blockchain = require("./Blockchain");
const Transaction = require("./Transaction");

const Rest = require("./Rest");

class Node {
    constructor(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port + id;
        this.id = id;
        this.n = n;
        this.wallet = new Wallet();
        let bootstrap_info = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null
        };
        this.rest = new Rest(this);
        this.contacts = new Array(n);
        this.received_contacts = 1;
        this.contacts[0] = bootstrap_info;
        this.blockchain = new Blockchain(capacity, difficulty);
        Object.seal(this);
    }

    // complex initialization should be outside of constructor
    init() {
        this.rest.init();
    }

    // start when restapp is ready
    start() {
        // if it's the bootstrap node
        if (this.id == 0) {
            this.contacts[0].publickey = this.wallet.publickey;
        }
        else {
            this.sendContact();
        }
    }

    // send contact info to bootstrap node
    sendContact() {
        let url = "http://" + this.contacts[0].ip + ":" + this.contacts[0].port + "/backend/newnode";
        axios.post(url, {
            id:             this.id,
            contact_info:   {
                ip:         this.ip,
                port:       this.port,
                publickey:  this.wallet.publickey
            }
        }
        );
    }

    // add contact to position id and update contact at all node when completed
    addContact (id, contact_info) {
        this.received_contacts += 1;
        this.contacts[id] = contact_info;
        if (this.received_contacts == this.n) {
            this.allNodesActive();
        }
    }

    action_receivecontacts(contacts) {
        console.log('I am Node' + this.id + ". Updating my contacts");
        this.contacts = contacts;
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

    broadcastContacts() {
        for (let id=0; id < this.contacts.length; id++) {
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivecontacts";
                axios.post(url, {
                    contacts:   this.contacts
                });
            }
        }
    }
    broadcastBlockchain() {
        for (let id=0; id < this.contacts.length; id++) {
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receiveblockchain";
                axios.post(url, {
                    blockchain:   this.blockchain
                });
            }
        }
    }
    static broadcastTransaction() {
    }

    // is called on bootstrap when all nodes are active
    allNodesActive() {
        // update all contacts
        this.broadcastContacts();
        let first_transaction = new Transaction(0, this.wallet.publickey, 100*this.n, this.wallet.privatekey);
        this.blockchain.getLatestBlock().transactions.push(first_transaction);
        this.broadcastBlockchain();
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
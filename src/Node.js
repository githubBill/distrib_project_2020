const axios = require('axios').default;

const Wallet = require("./Wallet")
const Block = require("./Block")
const Rest = require("./Rest")

class Node {
    constructor(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port + id;
        this.id = id;
        this.n = n;
        this.capacity = capacity;
        this.difficulty = difficulty;
        this.wallet = new Wallet(100*n);
        let bootstrap_info = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null
        }
        this.rest = new Rest(this);
        this.contacts = new Array(n);
        this.received_contacts = 1;
        this.contacts[0] = bootstrap_info;
        this.blockchain = [];
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

    // is called on bootstrap when all nodes are active
    allNodesActive() {
        // update all contacts
        for (let i=1; i < this.contacts.length; i++) {
            let url = "http://" + this.contacts[i].ip + ":" + this.contacts[i].port + "/backend/updatecontacts";
            axios.post(url, {
                contacts:   this.contacts
            });
        }
        // genesis
        let genesis_block = new Block(0, 0, 1);
        this.blockchain.push(genesis_block);
    }

    // for debugging
    getProperties() {
        let properties = {
            ip:                 this.ip,
            port:               this.port,
            id:                 this.id,
            number_of_nodes:    this.n,
            capacity:           this.capacity,
            wallet:             this.wallet.getProperties(),
            contacts:           this.contacts,
            blockchain:         this.blockchain
        }
        return properties;
    }


    create_block(id, nonce, previous_hash) {
        return new Block(id, nonce, previous_hash);
    }
}

Node.node = function() {
    return mynode;
};

function test() {
    this.text="test";
    this.sig=this.sign_transaction(this.text);
    this.check=this.verify_signature(this.sig, this.text, this.wallet.publickey);
    console.log(this.sig, "\n", this.check);
}

module.exports = Node;
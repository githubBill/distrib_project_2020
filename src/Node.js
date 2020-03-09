const axios = require('axios').default;

const Wallet = require("./Wallet")
const Block = require("./Block")
const Rest = require("./Rest")

class Node {
    constructor(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port + id;
        console.log(this.port);
        this.id = id;
        this.number_of_nodes = number_of_nodes;
        this.capacity = capacity;
        this.difficulty = difficulty;
        this.wallet = new Wallet();
        let bootstrap_info = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null
        }
        this.restapp = new Rest(this);
        this.contacts=[bootstrap_info];
        this.blockchain = [];
    }

    init() {
        // if it's the bootstrap node
        if (this.id == 0) {
            this.contacts[0].publickey = this.wallet.publickey;
        }
        else {
            this.send_contact();
        }
    }

    // send contact info to bootstrap node
    send_contact() {
        let url = "http://" + this.contacts[0].ip + ":" + this.contacts[0].port + "/backend/newnode";
        axios.post(url, {
            ip:         this.ip,
            port:       this.port,
            publickey:  this.wallet.publickey
        });
    }

    getProperties() {
        let properties = {
            ip:                 this.ip,
            port:               this.port,
            id:                 this.id,
            number_of_nodes:    this.number_of_nodes,
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
const Wallet = require("./Wallet")
const Block = require("./Block")
const Rest = require("./Rest")

class Node {
    ip;
    port;
    nodeid;
    capacity;
    difficulty;
    wallet;
    restapp;
    blockchain;

    constructor(ip, port, id, capacity, difficulty) {
        this.ip = ip;
        this.port = port;
        this.nodeid = id;
        this.capacity = capacity;
        this.difficulty = difficulty;
        this.wallet = new Wallet();
        this.restapp = new Rest(this);
        this.blockchain = [];
    }

    init() {
        //this.restapp.init();
    }
    getProperties() {
        let properties = {
            ip:         this.ip,
            port:       this.port,
            nodeid:     this.nodeid,
            capacity:   this.capacity,
            wallet:     this.wallet.getProperties(),
            blockchain: this.blockchain
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
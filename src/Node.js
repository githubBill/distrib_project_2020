const Wallet = require("./Wallet")
const Block = require("./Block")
const Rest = require("./Rest")

class Node {
    constructor(bootstrap_info, ip, port, id, capacity, difficulty) {
        this.ip = ip;
        this.port = port;
        this.id = id;
        this.capacity = capacity;
        this.difficulty = difficulty;
        this.wallet = new Wallet();
        this.restapp = new Rest(this);
        this.blockchain = [];
        this.contacts=[bootstrap_info];

        // if it's the bootstrap node
        if (this.id == 0) {
            this.contacts[0].publickey = this.wallet.publickey;
        }
        else {
            this.send_contact();
        }
    }

    send_contact() {
        let node_info = {
            ip:         this.ip,
            port:       this.port,
            publickey:  this.publickey
        }

    }
    getProperties() {
        let properties = {
            ip:         this.ip,
            port:       this.port,
            id:         this.id,
            capacity:   this.capacity,
            wallet:     this.wallet.getProperties(),
            blockchain: this.blockchain,
            contacts:   this.contacts
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
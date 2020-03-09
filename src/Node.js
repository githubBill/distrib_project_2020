const axios = require('axios').default;

const Wallet = require("./Wallet")
const Blockchain = require("./Blockchain")
const Rest = require("./Rest")

class Node {
    constructor(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        this.ip = ip;
        this.port = bootstrap_port + id;
        this.id = id;
        this.n = n;
        this.capacity = capacity;
        this.difficulty = difficulty;
        this.wallet = new Wallet(n);
        let bootstrap_info = {
            ip:   bootstrap_ip,
            port: bootstrap_port,
            publickey:      null
        }
        this.rest = new Rest(this);
        this.contacts = new Array(n);
        this.received_contacts = 1;
        this.contacts[0] = bootstrap_info;
        this.blockchain = new Blockchain();
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
        this.sendBlockchain();
        if (this.received_contacts == this.n) {
            this.allNodesActive();
        }
    }

    sendBlockchain() {
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
    }

    getLatestBlock() {
		return this.blockchain[this.blockchain.length - 1];
    }

    isBlockchainValid() {
		for (let i = 1; i < this.blockchain.length; i++){
			const currentBlock = this.blockchain[i];
			const previousBlock = this.blockchain[i - 1];

			if (currentBlock.hash !== currentBlock.hashBlock()) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}
		return true;
	}

    // for debugging
    getProperties() {
        let properties = {
            ip:             this.ip,
            port:           this.port,
            id:             this.id,
            n:              this.n,
            capacity:       this.capacity,
            difficulty:     this.difficulty,
            wallet:         this.wallet.getProperties(),
            contacts:       this.contacts,
            blockchain:     this.blockchain.getProperties()
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
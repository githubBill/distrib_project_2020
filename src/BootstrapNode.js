"use strict";

const axios = require('axios').default;

const Node = require("./Node");
const Transaction = require("./Transaction");
const Block = require("./Block");

/** @class BootstrapNode @extends {Node} */
class BootstrapNode extends Node {
    /**
     *Creates an instance of BootstrapNode.
     * @memberof BootstrapNode
     */
    constructor() {
        super();
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
     * @memberof BootstrapNode
     */
    init(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
        // gets activated when a new node is created
        this.rest.app.post('/backend/newnode', (req, res) => {
            let contact_info = req.body.contact_info;
            let id = req.body.id;
            res.send('I am Node' + this.id + ". Got a new contact " + contact_info);
            this.action_receivecontact(id, contact_info);
        });
        // inherited init
        super.init(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty);
        // genesis
        this.contacts[0].publickey = this.wallet.publickey;
        let first_transaction = new Transaction();
        first_transaction.init(this.wallet.privatekey, 0, this.wallet.publickey, 100*this.n, this.contacts[this.id].UTXO.slice());
        let last_block =  this.blockchain.getLatestBlock();
        last_block.transactions.push(first_transaction);
        this.contacts[0].UTXO.push(first_transaction.transaction_outputs[0]);
        if (last_block.transactions.length == this.blockchain.capacity) {
            let newblock = new Block();
            newblock.init(this.blockchain.getLatestBlock().index+1, 0, this.blockchain.getLatestBlock().current_hash);
            this.blockchain.mineBlock(newblock);
            this.blockchain.chain.push(newblock);
        }
    }

    /**
     *add contact to position id and update contacts at all nodes when completed
     * @param {number} id
     * @param {object} contact_info
     * @param {string} contact_info.ip
     * @param {number} contact_info.port
     * @param {string} contact_info.publickey
     * @param {object[]} contact_info.UTXO
     * @memberof Node
     */
    action_receivecontact (id, contact_info) {
        console.log('I am Node' + this.id + ". Got a new contact");
        this.received_contacts += 1;
        this.contacts[id] = JSON.parse(JSON.stringify(contact_info));
        // when all nodes are active
        if (this.received_contacts == this.n) {
            this.broadcastContacts();
        }
    }

    /**
     *When contacts have been delivered to all nodes
     *call method boradcastBlockchain()
     * @memberof BootstrapNode
     */
    broadcastContacts() {
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {
            let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivecontacts";
            axioses.push(axios.post(url, {
                contacts:   this.contacts
            }));
        }
        Promise.all(axioses).then(() => {
            this.broadcastBlockchain();
        }).catch((err) => {
            console.log(err);
        });
    }

    /**
     *When blockchain has been delivered to all nodes
     *call method boradcastBlockchain()
     * @memberof BootstrapNode
     */
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
        Promise.all(axioses).then(() => {
            this.initialTransactions();
        }).catch((err) => {
            console.log(err);
        });
    }

    /**
     *transfer 100 nbc to each node
     * @memberof BootstrapNode
     */
    initialTransactions() {
        for (let id=1; id < this.contacts.length; id++) {
            this.create_transaction(this.contacts[id].publickey, 100);
        }
        console.log("Bootstrap node. Finished all initial transactions");
        for (let id=0; id < this.contacts.length; id++) {   // other nodes
            let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/readfile";
            axios.post(url, {});
        }
    }
}

module.exports = BootstrapNode;
"use strict";

const axios = require('axios').default;
const fs = require('fs');

const Wallet = require("./Wallet");
const Blockchain = require("./Blockchain");
const Transaction = require("./Transaction");
const Rest = require("./Rest");
const Cli = require("./Cli");
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
        /** @type {Cli} */
        this.cli = new Cli(this);
        /** @type {object[]} */
        this.pending_transactions = [];
        this.transactions_to_create = [];
        this.started_creating_transactions = false;
        this.finished_transactions = true;
        this.count_transactions = 0;
        this.start_time=0;
        this.finish_time=0;
        this.transactions_time = 0;
        this.block_times = [];
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

        // add transactions from file to list
        let file = fs.readFileSync('data/transactions/'+this.n+'nodes/transactions'+this.id+'.txt', 'utf8');
        const lines = file.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line != "") {
                let [receiver_id, amount] = line.split(' ');
                receiver_id = parseInt(receiver_id.slice(2));
                amount = parseInt(amount);
                let transaction_to_create = {
                    receiver_id: receiver_id,
                    amount: amount
                };
                this.transactions_to_create.push(transaction_to_create);
            }
        }

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

    /** @memberof Node */
    async create_transactions() {
        if (this.transactions_to_create.length > 0) {
            this.count_transactions++;
            let transaction_to_create = this.transactions_to_create.shift();
            let receiver_id = transaction_to_create.receiver_id;
            let amount = transaction_to_create.amount;
            console.log('I am Node' + this.id + ". Creating transaction for "  + receiver_id + " with amount " + amount);
            this.create_transaction(this.contacts[receiver_id].publickey, amount);
        } else {
            console.log('I am Node' + this.id + ". Finished creating all transactions");
            this.finish_time = Date.now()/1000;
            this.transactions_time = (this.finish_time - this.start_time);
            this.cli.init();
        }
    }

    /**
     * @param {string} receiver_address
     * @param {number} amount
     * @memberof Node
     */
    async create_transaction(receiver_address, amount) {
        let transaction = new Transaction();
        transaction.init(this.wallet.privatekey, this.wallet.publickey, receiver_address, amount, this.contacts[this.id].UTXO.slice());
        this.broadcast_transaction(transaction);
    }
    /**
     * @param {Transaction} transaction
     * @memberof Node
     */
    async broadcast_transaction(transaction) {
        for (let id=0; id < this.contacts.length; id++) {       // other nodes
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receivetransaction";
                axios.post(url, {
                    transaction:   transaction
                });
            }
        }
        this.action_receivetransction(transaction);  // self
    }

    /**
     * @param {object} received_transaction
     * @memberof Node
     */
    async action_receivetransction(received_transaction) {
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
    async execute_pending_transactions() {
        if (this.pending_transactions.length > 0) {
            this.finished_transactions = false;
            let transaction = this.pending_transactions.shift();
            this.execute_transaction(transaction);
            //this.execute_pending_transactions();
        } else {
            this.finished_transactions = true;
            if (this.started_creating_transactions) {
                this.create_transactions();
            }
        }
    }

    /**
     * @param {Transaction} transaction
     * @memberof Node
     */
    async execute_transaction(transaction) {
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
                let start_time = Date.now();
                this.mine_block();
                let finish_time = Date.now();
                let block_time = (finish_time - start_time) / 1000;
                this.block_times.push(block_time);
            } else {
                this.end_transaction();
            }
        } else {
            console.log('I am Node' + this.id + ". Transaction is not valid");
            this.end_transaction();
        }
    }

    /**
     * @memberof Node
     */
    async mine_block() {
        let newblock = new Block();
        newblock.init(this.blockchain.getLatestBlock().index+1, 0, this.blockchain.getLatestBlock().current_hash);
        const isBlockMined = await this.blockchain.mineBlock(newblock);
        if (isBlockMined) {
            console.log('I am Node' + this.id + ". Mined block with index " + newblock.index + " and hash " + newblock.current_hash);
            // if mining was successful
            // broadcast block only if it hasn't received any during mining
            if (newblock.isValidated(this.blockchain.getLatestBlock().current_hash)) {
                this.broadcast_block(newblock);
            } else {
                this.end_transaction();
            }
        } else {
            this.end_transaction();
        }
    }

    /**
     * @param {Block} newblock
     * @memberof Node
     */
    async broadcast_block(newblock) {
        for (let id=0; id < this.contacts.length; id++) {   // other nodes
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/receiveblock";
                axios.post(url, {
                    block:   newblock
                });
            }
        }
        this.action_receiveblock(newblock);  // self
    }

    /**
     * @param {object} received_block
     * @memberof Node
     */
    async action_receiveblock(received_block) {
        let newblock = new Block();
        newblock.import(received_block);
        console.log('I am Node' + this.id + ". Received block with index " + newblock.index + " and current_hash " + newblock.current_hash);
        //if (newblock.index == this.blockchain.getLatestBlock().index+1) {   // accept only first received block of mining
            if (newblock.isValidated(this.blockchain.getLatestBlock().current_hash)) {
                console.log('I am Node' + this.id + ". Adding block with index " + newblock.index + " and current_hash " + newblock.current_hash);
                this.blockchain.chain.push(newblock);
                this.end_transaction();
            } else {
                this.resolve_conflict();
            }
        //} else {
        //    this.end_transaction();
        //}
    }

    /**
     * @memberof Node
     */
    async resolve_conflict() {
        console.log('I am Node' + this.id + ". Resolving conflict");
        let axioses = [];
        for (let id=0; id < this.contacts.length; id++) {
            if (id != this.id) {
                let url = "http://" + this.contacts[id].ip + ":" + this.contacts[id].port + "/backend/askedblockchain";
                axioses.push(axios.post(url, {
                    blockchain:   this.blockchain
                }).then((response) => {
                    if (response.data.chain.length >= this.blockchain.chain.length) {
                        this.blockchain.import(response.data);
                    }
                }));
            }
        }
        Promise.all(axioses).then(() => {
            this.end_transaction();
        });
    }

    async end_transaction() {
        console.log('I am Node' + this.id + ". Ended transaction");
        this.execute_pending_transactions();
    }

    /**
     *executed at all nodes after the inital transactions from bootstrap
     * @memberof Node
     */
    async read_file() {
        this.start_time = Date.now()/1000;
        this.started_creating_transactions = true;
        this.create_transactions();
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
     * @returns {string}
     * @memberof Node
     */
    show_help() {
        let help = `
        /transaction/<recipient_address>:<amount><br/>
        New transaction: Στείλε στο recipient_address wallet το ποσό amount από NBC coins που θα πάρει από
        το wallet sender_address. Θα καλεί συνάρτηση create_transaction στο backend που θα
        υλοποιεί την παραπάνω λειτουργία.<br/><br/>

        /view/<br/>
        View last transactions: Τύπωσε τα transactions που περιέχονται στο τελευταίο επικυρωμένο block του
        noobcash blockchain. Καλεί τη συνάρτηση view_transactions() στο backend που υλοποιεί την
        παραπάνω λειτουργία.<br/><br/>

        /balance/<br/>
        Show balance: Τύπωσε το υπόλοιπο του wallet.<br/><br/>

        /help/<br/>
        Επεξήγηση των παραπάνω εντολών.
        `;
        return help;
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
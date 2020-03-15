"use strict";

const express = require('express');

/**
 * @class Rest
 */
class Rest {

    /**
     *Creates an instance of Rest.
     * @param {Node} node
     * @memberof Rest
     */
    constructor(node) {
        this.node = node;   // reference to parent object
        this.app = express();
        this.app.use(express.json());

        Object.seal(this);
    }

    /**
     * @memberof Rest
     */
    init() {
        this.app.get('/', (req, res) => {
            res.send('I am Node' + this.node.id + ". Listening on ip " + this.node.ip + " and port " + this.node.port);
        });

        //////// DEBUGGING
        // shows node properties for debugging purposes
        this.app.get('/debug', (req, res) => {
            res.send(this.node.getProperties());
        });
        // shows node.contacts properties for debugging purposes
        this.app.get('/debug/contacts', (req, res) => {
            res.send(this.node.getProperties().contacts);
        });
        // shows node.blockchain properties for debugging purposes
        this.app.get('/debug/blockchain', (req, res) => {
            res.send(this.node.getProperties().blockchain);
        });
        ////////////////

        //////// CLIENT
        // does a transaction with amount to node with id
        this.app.get('/transaction/:id-:amount', (req, res) => {
            let id = req.params.id;
            let receiver_address = this.node.contacts[id].publickey;
            let amount = parseInt(req.params.amount);
            this.node.create_transaction(receiver_address, amount);
            res.send("I am node" + this.node.id + ". Doing transaction to " + id + " with amount " + amount);
        });
        // view last transactions
        this.app.get('/view', (req, res) => {
            let last_transactions = Object.assign({}, this.node.view_last_transactions());
            res.send(last_transactions);
        });
        // show balance
        this.app.get('/balance', (req, res) => {
            let balance_info = {
                balance:    this.node.show_balance()
            };
            res.send(balance_info);
        });
        ////////////////

        // gets activated when all nodes have been created
        this.app.post('/backend/receivecontacts', (req, res) => {
            console.log('I am Node' + this.node.id + ". Received contacts");
            this.node.action_receivecontacts(req.body.contacts);
            res.send('I am Node' + this.node.id + ". Received contacts");
        });
        // gets activated when all nodes have been created
        this.app.post('/backend/receiveblockchain', (req, res) => {
            console.log('I am Node' + this.node.id + ". Received Blockchain");
            this.node.action_receiveblockchain(req.body.blockchain);
            res.send('I am Node' + this.node.id + ". Received Blockchain");
        });
        // gets activated when a transaction is broadcasted
        this.app.post('/backend/receivetransaction', (req, res) => {
            this.node.action_receivetransction(req.body.transaction);
            res.send('I am Node' + this.node.id + ". Received Transaction");
        });
        // gets activated when a block is broadcasted
        this.app.post('/backend/receiveblock', (req, res) => {
            this.node.action_receiveblock(req.body.block);
            res.send('I am Node' + this.node.id + ". Received Block");
        });
        // gets activated when a block is broadcasted
        this.app.post('/backend/askedblockchain', (req, res) => {
            res.send(this.node.blockchain.getProperties());
        });
        // start logic when rest is ready
        this.app.listen(this.node.port, this.node.sendContact());
    }
}

module.exports = Rest;
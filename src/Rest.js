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

        // for debugging
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

        // does a transaction with amount to node with id
        this.app.get('/client/doTransaction/:id-:amount', (req, res) => {
            let id = req.params.id;
            let receiver_address = this.node.contacts[id].publickey;
            let amount = parseInt(req.params.amount);
            this.node.create_transaction(receiver_address, amount);
            res.send("I am node" + this.node.id + ". Doing transaction to " + id + " with amount " + amount);
        });

        // gets activated when all nodes have been created
        this.app.post('/backend/receivecontacts', (req, res) => {
            console.log('I am Node' + this.node.id + ". Received contacts");
            res.send('I am Node' + this.node.id + ". Received contacts");
            this.node.action_receivecontacts(req.body.contacts);
        });
        // gets activated when all nodes have been created
        this.app.post('/backend/receiveblockchain', (req, res) => {
            console.log('I am Node' + this.node.id + ". Received Blockchain");
            res.send('I am Node' + this.node.id + ". Received Blockchain");
            this.node.action_receiveblockchain(req.body.blockchain);
        });
        // gets activated when a transaction is broadcasted
        this.app.post('/backend/receivetransaction', (req, res) => {
            res.send('I am Node' + this.node.id + ". Received Transaction");
            this.node.action_receivetransction(req.body.transaction);
        });
        // gets activated when a block is broadcasted
        this.app.post('/backend/receiveblock', (req, res) => {
            res.send('I am Node' + this.node.id + ". Received Block");
            this.node.action_receiveblock(req.body.block);
        });

        // start logic when rest is ready
        this.app.listen(this.node.port, this.node.sendContact());
    }
}

module.exports = Rest;
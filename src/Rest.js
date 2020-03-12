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
        // shows node properties for debugging purposes
        this.app.get('/debug/contacts', (req, res) => {
            res.send(this.node.getProperties().contacts);
        });
        // shows node properties for debugging purposes
        this.app.get('/debug/blockchain', (req, res) => {
            res.send(this.node.getProperties().blockchain);
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
            console.log('I am Node' + this.node.id + ". Received Trabsaction");
            res.send('I am Node' + this.node.id + ". Received Transaction");
            this.node.action_receivetransction(req.body.transaction);
        });

        // start logic when rest is ready
        this.app.listen(this.node.port, this.node.sendContact());
    }
}

module.exports = Rest;
"use strict";

const express = require('express');

/**
 * @class Rest
 */
class Rest {

    /**
     *Creates an instance of Rest.
     * @param {*} node
     * @memberof Rest
     */
    constructor(node) {
        this.node = node;   // reference to parent object
        this.app = express();
        this.app.use(express.json());

        this.app.get('/', (req, res) => {
            res.send('I am Node' + this.node.id + ". Listening on ip " + this.node.ip + " and port " + this.node.port);
        });

        // shows node properties for debugging purposes
        this.app.get('/debug', (req, res) => {
            res.send(this.node.getProperties());
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

        // only on bootstrap node
        // gets activated when a new node is created
        if (this.node.id == 0) {
            this.app.post('/backend/newnode', (req, res) => {
                let contact_info = req.body.contact_info;
                let id = req.body.id;
                console.log('I am Node' + this.node.id + ". Got a new contact " + JSON.stringify(contact_info));
                res.send('I am Node' + this.node.id + ". Got a new contact " + contact_info);
                this.node.action_receivecontact(id, contact_info);
            });
        }

        Object.seal(this);
    }


    /**
     * @memberof Rest
     */
    init() {
        // start logic when rest is ready
        this.app.listen(this.node.port, this.node.start());
    }
}

module.exports = Rest;
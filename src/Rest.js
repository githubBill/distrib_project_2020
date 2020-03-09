const express = require('express');

class Rest {
    constructor(node) {
        this.node = node;   // reference to parent object
        this.app = express();
    }

    init() {
        this.app.use(express.json());

        this.app.get('/', (req, res) => {
            res.send('I am Node' + this.node.id + ". Listening on ip " + this.node.ip + " and port " + this.node.port);
        });

        // shows node properties for debugging purposes
        this.app.get('/debug', (req, res) => {
            res.send(this.node.getProperties());
        });

        // gets activated when all nodes have been created
        this.app.post('/backend/updatecontacts', (req, res) => {
            console.log('I am Node' + this.node.id + ". Updating my contacts");
            res.send('I am Node' + this.node.id + ". Updating my contacts");
            this.node.contacts = req.body.contacts;
            this.node.received_contacts = this.node.contacts.length;
        });

        // only on bootstrap node
        // gets activated when a new node is created
        if (this.node.id == 0) {
            this.app.post('/backend/newnode', (req, res) => {
                let contact_info = req.body.contact_info;
                let id = req.body.id;
                console.log('I am Node' + this.node.id + ". Got a new contact " + JSON.stringify(contact_info));
                res.send('I am Node' + this.node.id + ". Got a new contact " + contact_info);
                this.node.addContact(id, contact_info);
            });
        }

        // start logic when rest is ready
        this.app.listen(this.node.port, this.node.start());
    }
}

module.exports = Rest;
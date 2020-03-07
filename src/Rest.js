const express = require('express');
const axios = require('axios').default;


class Rest {
    constructor(node) {
        this.node = node;       // access parent object
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
        this.app.post('/backend/updatecontacts', (req, res) => {
            console.log('I am Node' + this.node.id + ". I am updating my contacts");
            res.send('I am Node' + this.node.id + ". I am updating my contacts");
            this.node.contacts = req.body.contacts;
        });

        // only on bootstrap node
        // gets activated when a new node is created
        if (this.node.id == 0) {
            this.app.post('/backend/newnode', (req, res) => {
                let contact_info = req.body;
                console.log('I am Node' + this.node.id + ". I just got a new contact " + contact_info);
                res.send('I am Node' + this.node.id + ". I just got a new contact " + contact_info);
                this.node.contacts.push(contact_info);
                if (this.node.contacts.length == this.node.number_of_nodes) {
                    for (let i=1; i < this.node.contacts.length; i++) {
                        let url = "http://" + this.node.contacts[i].ip + ":" + this.node.contacts[i].port + "/backend/updatecontacts";
                        axios.post(url, {
                            contacts:   this.node.contacts
                        });
                    }
                }
            });
        }

        this.app.listen(this.node.port, () => console.log('I am Node' + this.node.id + ". Listening on ip " + this.node.ip + " and port " + this.node.port))
    }
}

module.exports = Rest;
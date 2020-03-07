const express = require('express');

class Rest {
    node;   // access to parent object
    app;
    constructor(node) {
        this.node = node;
        //this.app = null;
        this.app = express();
        this.app.get('/', (req, res) => {
            res.send('I am Node' + this.node.nodeid + " Listening on port " + this.node.port);
        });
        this.app.get('/debug', (req, res) => {
            res.send(this.node.getProperties());
        });
        this.app.listen(this.node.port, () => console.log('I am Node' + this.node.id + " Listening on port " + this.node.port))
    }
}

module.exports = Rest;
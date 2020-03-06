const express = require('express');

NODE = require("./node.js")


module.exports = class REST {
    node;
    constructor(ip, port, id, capacity) {
        this.node = new NODE(ip, port, id, capacity);
        const app = express();

        app.get('/', (req, res) => {
            res.send('I am Node' + this.node.id + " Listening on port " + this.node.port);
        });
        app.get('/debug', (req, res) => {
            res.send(this.node);
        });
        app.listen(this.node.port, () => console.log('I am Node' + this.node.id + " Listening on port " + this.node.port))
    }
}
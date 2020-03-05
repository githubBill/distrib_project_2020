module.exports = class REST {
    constructor(id) {
        const express = require('express');
        const app = express();
        const startport = 3000;
        const nodeid = id;
        const port = startport+nodeid;

        app.get('/', (req, res) => {
            res.send('I am Node' + nodeid + " Listening on port " + port);
        });
        app.listen(port, () => console.log('I am Node' + nodeid + " Listening on port " + port))
    }
}
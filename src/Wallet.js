"use strict";

const NodeRSA = require('node-rsa');

class Wallet {
    constructor() {
        let key = new NodeRSA({b: 256});
        key.generateKeyPair();
        this.privatekey = key.exportKey('private');
        this.publickey = key.exportKey('public');
        Object.seal(this);
    }

    getProperties() {
        let properties = {
            privatekey: this.privatekey,
            publickey:  this.publickey
        };
        return properties;
    }
}

module.exports = Wallet;
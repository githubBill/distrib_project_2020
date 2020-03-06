const NodeRSA = require('node-rsa');

module.exports = class WALLET {
    privatekey;
    publickey;

    constructor() {
        const key = new NodeRSA({b: 256});
        key.generateKeyPair();
        this.privatekey = key.exportKey('private');
        this.publickey = key.exportKey('public');
    }
}
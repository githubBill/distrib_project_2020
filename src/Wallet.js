"use strict";

const NodeRSA = require('node-rsa');

/**
 * @class Wallet
 */
class Wallet {
    /**
     *Creates an instance of Wallet.
     * @memberof Wallet
     */
    constructor() {
        let key = new NodeRSA({b: 256});
        key.generateKeyPair();
        this.privatekey = key.exportKey('private');
        this.publickey = key.exportKey('public');
        Object.seal(this);
    }


    /**
     * @returns {object} properties
     * @memberof Wallet
     */
    getProperties() {

        let properties = {
            privatekey: this.privatekey,
            publickey:  this.publickey
        };
        return properties;
    }
}

module.exports = Wallet;
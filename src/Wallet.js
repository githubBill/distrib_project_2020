"use strict";

const NodeRSA = require('node-rsa');

/** @class Wallet */
class Wallet {
    /**
     *Creates an instance of Wallet.
     * @memberof Wallet
     * @property {string} privatekey
     * @property {string} publickey
     */
    constructor() {
        /** @type {string} */
        this.privatekey = "";
        /** @type {string} */
        this.publickey = "";
        Object.seal(this);
    }

    /**
     * @memberof Wallet
     */
    init() {
        let key = new NodeRSA({b: 256});
        key.generateKeyPair();
        this.privatekey = key.exportKey('private');
        this.publickey = key.exportKey('public');
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
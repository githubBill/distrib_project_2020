"use strict";

const NodeRSA = require('node-rsa');
const jwa = require('jwa');

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

    static verify_signature (signature, transaction, publicKey){
        const rsa_sign = jwa('RS256');
        const input = transaction ; //string
        var check = rsa_sign.verify(input, signature, publicKey);
        return check ;
    }
}

module.exports = Wallet;
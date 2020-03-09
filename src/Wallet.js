const NodeRSA = require('node-rsa');
const jwa = require('jwa');

class Wallet {
    constructor(n) {
        let key = new NodeRSA({b: 256});
        key.generateKeyPair();
        this.privatekey = key.exportKey('private');
        this.publickey = key.exportKey('public');
        this.nbc = 0;
    }

    getProperties() {
        let properties = {
            privatekey: this.privatekey,
            publickey:  this.publickey,
            nbc:        this.nbc
        }
        return properties;
    }

    sign_transaction (transaction){
        const rsa_sign = jwa('RS256');
        const input = transaction ; //string
        const signature = rsa_sign.sign(input,this.privatekey);
        return signature;
    };

    verify_signature (signature, transaction, publicKey){
        const rsa_sign = jwa('RS256');
        const input = transaction ; //string
        var check = rsa_sign.verify(input, signature, publicKey);
        return check ;
    };
}

module.exports = Wallet;
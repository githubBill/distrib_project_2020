const jwa = require('jwa');

REST = require("./rest.js")
WALLET = require("./wallet.js")


module.exports = class NODE {
    nodeid;
    wallet;
    restapp;
    blockchain;

    constructor(id) {
        this.nodeid = id;
        this.wallet = new WALLET();
        this.restapp = new REST(this.nodeid);
        this.blockchain = [];
    }

    sign_transaction (transaction){
        const rsa_sign = jwa('RS256');
        const input = transaction ; //string
        const signature = rsa_sign.sign(input,this.wallet.privatekey);
        return signature;
    };

    verify_signature (signature, transaction, publicKey){
        const rsa_sign = jwa('RS256');
        const input = transaction ; //string
        var check = rsa_sign.verify(input, signature, publicKey);
        return check ;
    };
}

function test() {
    this.text="test";
    this.sig=this.sign_transaction(this.text);
    this.check=this.verify_signature(this.sig, this.text, this.wallet.publickey);
    console.log(this.sig, "\n", this.check);
}
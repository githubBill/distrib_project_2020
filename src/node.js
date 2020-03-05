REST=require("./rest.js")
WALLET=require("./wallet.js")

module.exports = class NODE {
    constructor(id) {
        this.nodeid = id;
        this.wallet = new WALLET();
        this.restapp = new REST(this.nodeid);
        this.blockchain = [];
    }
}
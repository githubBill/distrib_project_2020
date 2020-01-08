const sha256 = require('sha256');
const generate_rsa_keypair = require('generate-rsa-keypair');
const jwa = require('jwa');

function Wallet(){
	const pair = generate_rsa_keypair();
	this.privateKey = pair.private ;
	this.publicKey = pair.public ;
};

Wallet.prototype.sign_transaction = function(transaction, privateKey){
	const rsa_sign = jwa('RS256');
	const input = transaction ; //string 
	const signature = rsa_sign.sign(input,privateKey);

	return signature ;
};

Wallet.prototype.verify_transaction = function(signature, transaction, publicKey){
	const rsa_sign = jwa('RS256');
	const input = transaction ; //string
	var check = rsa_sign.verify(input, signature, publicKey);

	return check ;
};

module.exports = Wallet ;
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];
};

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash, blockTransactions, timestamp) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: timestamp ,
		transactions: blockTransactions,
		nonce: nonce,
		current_hash: hash,
		previous_hash: previousBlockHash
	};

	this.chain.push(newBlock);

	return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};


Blockchain.prototype.createNewTransaction = function(amount, sender_address, receiver_address, wallet, t_ins, total_cash) {
	
	const t_hash = sha256(amount.toString()+sender_address+receiver_address+ (uuid().split('-').join('')) );
	const signature = wallet.sign_transaction(t_hash, wallet.privateKey);

	const t_outs = [{
		id: uuid().split('-').join(''),
		source_id: t_hash,
		recipient: receiver_address,
		amount: amount
	},
	{
		id: uuid().split('-').join(''),
		source_id: t_hash,
		recipient: sender_address,
		amount: (total_cash - amount)
	}];
	const newTransaction = {
		amount: amount,
		sender_address: sender_address,
		receiver_address: receiver_address,
		transaction_id: t_hash,
		signature: signature,
		transaction_inputs: t_ins,
		transaction_outputs: t_outs
		//Timestamps ???
	};

	return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
};

Blockchain.prototype.validate_transaction = function(newTransaction, wallet) {
	const cond_a = wallet.verify_transaction(newTransaction['signature'], newTransaction['transaction_id'], newTransaction['sender_address']) ;
	const cond_b = (newTransaction['transaction_outputs'][1]['amount'] >= 0);

	if(cond_a && cond_b)
		return true;
	else
		return false;
};

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData, difficulty, difficulty_string) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, difficulty) !== difficulty_string) {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
};


Blockchain.prototype.validate_block = function(block, prvBlock, difficulty, difficulty_string) {
	return ( (block['current_hash'].substring(0, difficulty) === difficulty_string) && (block['previous_hash'] === prvBlock['current_hash']) );
};

Blockchain.prototype.validate_chain = function(blockchain, a, b) {
	var validChain = true;
	
	if(blockchain.length > 1){
		console.log("check chain");
		for (var i = 1; i < blockchain.length; i++) {
			const currentBlock = blockchain[i];
			const prevBlock = blockchain[i - 1];
			if(!(this.validate_block(currentBlock, prevBlock, a, b)))
				validChain = false ;
		};
	}

	return validChain;
};

module.exports = Blockchain;















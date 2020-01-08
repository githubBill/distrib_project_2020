const express = require('express');
const rp = require('request-promise');
const HashMap = require('hashmap');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const sha256 = require('sha256');
const fs = require('fs');
var waitUntil = require('wait-until');
const perf = require('execution-time')();

const Blockchain = require('./blockchain');
const Wallet = require('./wallet');

const port = process.argv[2];
const capacity = process.argv[4];
const n = process.argv[5] - 1 ;
const difficulty = process.argv[6];

const app = express();
const noobcash = new Blockchain();
const wallet = new Wallet();
var wallets = new HashMap();
var nodes_stats = new HashMap();

const nodeAddress = wallet.publicKey ;
var difficulty_string = "0000";
if(difficulty == 5)
	difficulty_string = "00000"
var curr_capacity = 0;
var node_uid_str;
var starter_transactions = 0;
var input_transactions = [];

//maxTimeStamp
//minTimeStamp for throughput


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const reg_promise = [];
//register at bootstrap
const RegisterOptions = {
	uri: 'http://192.168.0.2:3001/register-at-bootstrap',
	method: 'POST',
	body: {
		newNodeUrl: noobcash.currentNodeUrl,
		nodeAddress: nodeAddress
	},
	json: true
};

reg_promise.push(rp(RegisterOptions));

Promise.all(reg_promise)
.then((data) => {
	console.log("Register at bootstrap");
})
.catch(err => {
	console.log(err);
});


app.post('/get_uid', function(req, res){
	res.send();
	node_uid_str = req.body.uid.toString() ;
	const input_file = '/home/user/Noobcash/dev/' + node_uid_str + '.txt';

	var data = fs.readFileSync(input_file,'utf8');

	var lines = data.toString().split(/\r?\n/) ;
	lines.forEach((line) => {
		input_transactions.push(line);
	});
});


//front_end Client Endpoints
app.get('/new_transaction', function(req, res){
	const sender = req.query.sender ;
	const recipient = req.query.recipient.toString();
	const amount = parseInt(req.query.amount, 10);
	const url = nodes_stats.get(sender)['url'];

	const RegisterOptions = {
		uri: url + '/transaction/broadcast',
		method: 'POST',
		body: { 
			id_num: recipient,
			amount: amount
		},
		json: true
	};
	rp(RegisterOptions)
	.then( (data) => {
		res.send({ amount }) ;
	})
	.catch( err => {
		return err 
	});
});

app.get('/help', function(req, res){
	res.set('text/html').send(`
	<b>View</b><br>
	View last transactions: Τύπωσε τα transactions που περιέχονται στο τελευταίο επικυρωμένο block του noobcash blockchain.<br>
	Καλεί τη συνάρτηση view_transactions() στο backend που υλοποιεί την παραπάνω λειτουργία.<br>
	<br>
	<br>
	<b>Transaction <sender_address> <recipient_address> <amount></b><br>
	New transaction: Στείλε στο recipient_address wallet το ποσό amount από NBC coins που θα πάρει από<br>
	το wallet sender_address. Θα καλεί συνάρτηση create_transaction στο backend που θα<br>
	υλοποιεί την παραπάνω λειτουργία.<br>
	<br>
	<br>
	<b>Balance</b><br>
	Show balance: Τύπωσε το υπόλοιπο του wallet.<br>
	<br>
	<br>
	<b>Help</b><br>
	Επεξήγηση των παραπάνω εντολών.`
	);
});

app.get('/wallet_balance/:uid', function(req, res) {
	const uid = req.params.uid.toString();
	res.send({
		balance: wallet_balance(nodes_stats.get(uid)['publicKey'])
	})
});

app.get('/view', function(req, res) {
	res.send(noobcash.getLastBlock()['transactions']) ;
});



mine_block = function(){
	curr_capacity = curr_capacity - capacity ;
	const lastBlock = noobcash.getLastBlock();
	const previousBlockHash = lastBlock['current_hash'];
	const blockTransactions = noobcash.pendingTransactions.splice(0,capacity);
	//usedTransactions.push(blockTransactions); hashmap
	const currentBlockData = {
		transactions: blockTransactions,
		index: lastBlock['index'] + 1,
		timestamp: Date.now()
	};

	perf.start("Mining Block");
	const nonce = noobcash.proofOfWork(previousBlockHash, currentBlockData, difficulty, difficulty_string);
	const blockHash = noobcash.hashBlock(previousBlockHash, currentBlockData, nonce);
	//const newBlock = noobcash.createNewBlock(nonce, previousBlockHash, blockHash, blockTransactions, currentBlockData['timestamp']);
	const results = perf.stop("Mining Block");
	console.log("Mining Block No." +  currentBlockData['index'].toString() + ":", results.time);

	const newBlock = {
		index: noobcash.chain.length + 1,
		timestamp: currentBlockData['timestamp'],
		transactions: blockTransactions,
		nonce: nonce,
		current_hash: blockHash,
		previous_hash: previousBlockHash
	};

	//broadcast_block()
	const requestPromises = [];
	noobcash.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});
	
	const requestOptions_self = {
			uri: noobcash.currentNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
	};

	requestPromises.push(rp(requestOptions_self));
	
	Promise.all(requestPromises)
	.then(data => {
		console.log("Block transmitted");
	})
	.catch(err => {
		console.log("err2");
		console.log(err);
	});
};

resolve_conflict = function(){
	// consensus
	const requestPromises = [];
	noobcash.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = noobcash.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !noobcash.validate_chain(newLongestChain, difficulty, difficulty_string))) {
			//res.send();
			console.log({
				note: 'Current chain has not been replaced.',
				chain: noobcash.chain
			});
		}
		else {
			//res.send();
			noobcash.chain = newLongestChain;
			noobcash.pendingTransactions = newPendingTransactions;
			console.log({
				note: 'This chain has been replaced.',
				chain: noobcash.chain
			});
		}
	})
	.catch(err => {
		console.log("err3");
		console.log(err);
	});
};

wallet_balance = function(key) {
	var balance = 0;
	wallets.get(key).forEach((utxo)=>{
		balance = balance + utxo['amount'] ;
	});

	return balance ;
}

NBC_giveaway = function(iter, id) {
	if(iter > 0){
		const RegisterOptions = {
			uri: noobcash.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				id_num: "id" + id,
				amount: 100
			},
			json: true
		};
					
		rp(RegisterOptions)
		.then((uid) => {
			NBC_giveaway(iter - 1, id + 1 );
		});
	}
}

execute_input_transactions = function(curr, end) {
	if(curr < end){
		const RegisterOptions = {
			uri: noobcash.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				id_num: input_transactions[curr].split(" ")[0].toString(),
				amount: parseInt(input_transactions[curr].split(" ")[1])
			},
			json: true
		};
	
		rp(RegisterOptions)
		.then((data) => {
			execute_input_transactions(curr + 1, end);
		});
	}
}


// get wallets
app.get('/wallets', function (req, res) {
	
	var wall = [] ;
	wallets.forEach((value, key) => {
		wall.push({key, value});
	});
	res.send(wall);
});

app.get('/nodes_stats', function(req, res) {
	var stats = [] ;
	nodes_stats.forEach((value, key) => {
		stats.push({key, value});
	});
	res.send(stats);
});

// get entire blockchain
app.get('/blockchain', function (req, res) {
	res.send(noobcash);
});

// verify a new transaction
app.post('/validate_transaction', function(req, res) {
	const newTransaction = req.body.newTransaction;
	const spent_count = req.body.spent_count;
	if(noobcash.validate_transaction(newTransaction, wallet)){
		res.send("1");
	}
	else{
		//reject
		res.send("0");
	}
});

// verify a new transaction
app.post('/add_to_pending', function(req, res) {
	const newTransaction = req.body.newTransaction;
	const spent_count = req.body.spent_count;
	noobcash.addTransactionToPendingTransactions(newTransaction);
	starter_transactions = (starter_transactions + 1)%(10000);
	//change receiver's wallet
	wallets.get(newTransaction['receiver_address']).push(newTransaction['transaction_outputs'][0]);
	//change sender's wallet
	wallets.get(newTransaction['sender_address']).splice(0,spent_count);
	wallets.get(newTransaction['sender_address']).push(newTransaction['transaction_outputs'][1]);
	
 	curr_capacity = curr_capacity + 1 ;
	res.send("1");
	if( curr_capacity >= capacity ){
		mine_block();
	}
});

// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	var t_inputs = [];
	var total_cash = 0;
	var spent_count = 0 ;
	wallets.get(nodeAddress).forEach((UTXO) =>{
		total_cash = total_cash + UTXO['amount'] ;
		t_inputs.push(UTXO['id']);
		spent_count = spent_count + 1;
	});

	const recipient = nodes_stats.get(req.body.id_num)['publicKey'] ;

	const newTransaction = noobcash
	.createNewTransaction(req.body.amount, nodeAddress, recipient, wallet, t_inputs, total_cash);

	if(noobcash.validate_transaction(newTransaction, wallet)){

		const requestPromises = [];
		noobcash.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/validate_transaction',
				method: 'POST',
				body: {
					newTransaction,
					spent_count
				},
				json: true
			};

			requestPromises.push(rp(requestOptions));
		});

		Promise.all(requestPromises)
		.then((data) => {
			var valid = true;
			data.forEach((response)=>{
				if(response.toString() === "0")
					valid = false;
			});
			if(valid){
				const request_promises = [];
				noobcash.networkNodes.forEach(networkNodeUrl => {
					const requestOptions = {
						uri: networkNodeUrl + '/add_to_pending',
						method: 'POST',
						body: {
							newTransaction,
							spent_count
						},
						json: true
					};
					request_promises.push(rp(requestOptions));
				});

				Promise.all(request_promises)
				.then((data) => {
					res.send();
				})
				.catch(err => {
					console.log("err2.3");
				});			
				noobcash.addTransactionToPendingTransactions(newTransaction);
				//change receiver's wallet
				wallets.get(newTransaction['receiver_address']).push(newTransaction['transaction_outputs'][0]);
				//change sender's wallet
				wallets.get(newTransaction['sender_address']).splice(0,spent_count);
				wallets.get(newTransaction['sender_address']).push(newTransaction['transaction_outputs'][1]);
				curr_capacity = curr_capacity + 1 ;
					
				//if capacity full
				//mine...
				if( curr_capacity >= capacity ){
					mine_block();
				}
				res.send("Transaction Validated");
			}
			else
				//do nothing
				res.send("Transaction Not Validated");
		}).catch((err) => {
			console.log(err);
		});
	}
});
// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = noobcash.getLastBlock();
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	
	if(correctIndex){
		const correctHash = noobcash.validate_block(newBlock, lastBlock, difficulty, difficulty_string); 

		if (correctHash) {
			noobcash.chain.push(newBlock);
			const transactions_to_delete = newBlock['transactions'] ;
			var index;
			transactions_to_delete.forEach((t) => {
				index = noobcash.pendingTransactions.indexOf(t);
				if(index !== -1)
					noobcash.pendingTransactions.splice(index, 1);
			});

			curr_capacity = noobcash.pendingTransactions.length;
			res.json({
				note: 'New block received and accepted.',
				newBlock: newBlock
			});
		} else {
			res.json({
				note: 'Different BlockChain',
				newBlock: newBlock
			});
			//consensus
			resolve_conflict();
		}
	}
	else {
		console.log('New block rejected. It came second');
		res.json({
			note: 'New block rejected. It came second'
		});
	}
});

// register a node with the network
app.post('/register-node', function(req, res) {
	
	const unhashed_wallets = req.body.wallets;	
	wallets['_data'] = unhashed_wallets['_data'];
	wallets['size'] = unhashed_wallets['size'];

	const networkNodes = req.body.networkNodes;
	networkNodes.forEach(networkNodeUrl => {
	const nodeNotAlreadyPresent = noobcash.networkNodes.indexOf(networkNodeUrl) == -1;
	const notCurrentNode = noobcash.currentNodeUrl !== networkNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode)
		noobcash.networkNodes.push(networkNodeUrl);
	});
	noobcash.networkNodes.push("http://192.168.0.2:3001") ;

	const unhashed_nodes_stats = req.body.nodes_stats;
	nodes_stats['_data'] = unhashed_nodes_stats['_data'];
	nodes_stats['size'] = unhashed_nodes_stats['size'];

	if(noobcash.validate_chain(req.body.blockchain)){
		noobcash.chain = req.body.blockchain ;
		console.log("Chain Valid");
		res.send("OK")
		waitUntil()
		.interval(50)
		.times(40000)
		.condition(function() {
			return (starter_transactions >= n + 1);
		})
		.done(function(result) {
			if(result){
				execute_input_transactions(0, input_transactions.length);
			}
			else{
				console.log("Starter Transactions Not Completed");
			}
		});
	}
	else {
		console.log("Chain Not Valid");
		res.send("Error")
	}
});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});

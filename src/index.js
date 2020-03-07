
const Node = require("./Node")

let number_of_nodes = process.argv[2];
let capacity = parseInt(process.argv[3]);
let difficulty = parseInt(process.argv[4]);
let bootstrap_ip = process.argv[5];
let bootstrap_port = 3000;

let ip = process.argv[6];
let id = parseInt(process.argv[7]);
let bootstrap_info = {
    ip:         bootstrap_ip,
    port:       bootstrap_port,
    publickey:  null
}

console.log("Running with number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
function node() {
    let port = bootstrap_port+id;
    let mynode = new Node(bootstrap_info, ip, port, id, capacity, difficulty);
    myblock = mynode.blockchain.push(mynode.create_block(0, 0, 1));
}

node();
id=1;
node();

/*
for (id=0; id<number_of_nodes; id++) {
    let port = startport + id;
    let mynode = new Node(ip, port, id, capacity);
    //window.mynode = mynode;
    //global.mynode = mynode;
    mynode.init();
    myblock = mynode.create_block(0, 0, 1);
    //console.log(mmynode.node);
}
*/
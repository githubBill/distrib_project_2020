
const Node = require("./Node")

let number_of_nodes = process.argv[2];
let capacity = parseInt(process.argv[3]);
let difficulty = parseInt(process.argv[4]);

let ip = "localhost";
let startport = 3000;

console.log("Running with number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
function bootstrap_node() {
    let id=0;
    let port = startport+id;
    let mynode = new Node(ip, port, id, capacity, difficulty);
    mynode.init();
    myblock = mynode.blockchain.push(mynode.create_block(0, 0, 1));
}

bootstrap_node();

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
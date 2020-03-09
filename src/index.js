
const Node = require("./Node");
const { spawn } = require('child_process');

function create_node(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty) {
    let mynode = new Node(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty);
    mynode.init();
}

let number_of_nodes = process.argv[2];
let capacity = parseInt(process.argv[3]);
let difficulty = parseInt(process.argv[4]);

function spawn_process(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty) {
    let child = spawn('node', ['.', number_of_nodes, capacity, difficulty, bootstrap_ip, ip, id]);
    child.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`${data}`);
    });
}

function spawn_nodes (bootstrap_ip, bootstrap_port, ip, number_of_nodes, capacity, difficulty) {
    for (let id=1; id<number_of_nodes; id++) {
        spawn_process(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty);
    }
}
// running experiment with multiple processes at localhost
if (process.argv.length == 5) {
    let bootstrap_ip = "localhost";
    let bootstrap_port = 3000;
    let ip = "localhost";
    console.log("Running local experiment with number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
    // spawn node0
    let id = 0;
    spawn_process(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty);
    // spawn remaining nodes with delay
    setTimeout(function(){
        spawn_nodes(bootstrap_ip, bootstrap_port, ip, number_of_nodes, capacity, difficulty);
    }, 8000);
} // running a specific node with given infromation
else if (process.argv.length == 8) {
    let bootstrap_ip = process.argv[5];
    let bootstrap_port = 3000;
    let ip = process.argv[6];
    let id = parseInt(process.argv[7]);

    console.log("Running node" + id + " number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
    console.log("Bootstraip_ip: " + bootstrap_ip + " myip: " + ip + " myid: " + id);
    create_node(bootstrap_ip, bootstrap_port, ip, id, number_of_nodes, capacity, difficulty);
} else {
    console.log("Total arguments must be 5 or 8");
}

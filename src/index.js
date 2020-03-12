"use strict";

const BootstrapNode = require("./BootstrapNode");
const Node = require("./Node");

let n = parseInt(process.argv[2]);
let capacity = parseInt(process.argv[3]);
let difficulty = parseInt(process.argv[4]);

// running a specific node with given infromation
if (process.argv.length == 8) {
    let bootstrap_ip = process.argv[5];
    let bootstrap_port = 3000;
    let ip = process.argv[6];
    let id = parseInt(process.argv[7]);

    console.log("Running node" + id + " with n: " + n + " capacity: " + capacity + " difficulty: " + difficulty +
                " bootstraip_ip: " + bootstrap_ip + " myip: " + ip + " myid: " + id);
    let mynode=null;
    if (id == 0) {
        mynode = new BootstrapNode();
    } else {
        mynode = new Node();
    }
    mynode.init(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty);
} else {
    console.log("Arguments: n capacity difficulty bootstrap_ip ip id");
}

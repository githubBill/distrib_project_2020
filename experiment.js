"use strict";

const { spawn } = require('child_process');

let n = parseInt(process.argv[2]);
let capacity = parseInt(process.argv[3]);
let difficulty = parseInt(process.argv[4]);

/**
 * @param {string} bootstrap_ip bootstrap_ip
 * @param {number} bootstrap_port bootstrap_port
 * @param {string} ip ip
 * @param {number} id id
 * @param {number} n n
 * @param {number} capacity capacity
 * @param {number} difficulty difficulty
 */
function spawn_process(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty) {
    let child = spawn('node', ['.', n, capacity, difficulty, bootstrap_ip, ip, id]);
    child.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`${data}`);
    });
}

/**
 * @param {string} bootstrap_ip
 * @param {number} bootstrap_port
 * @param {string} ip
 * @param {number} n
 * @param {number} capacity
 * @param {number} difficulty
 */
function spawn_nodes (bootstrap_ip, bootstrap_port, ip, n, capacity, difficulty) {
    for (let id=1; id<n; id++) {
        spawn_process(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty);
    }
}
// running experiment with multiple processes at localhost
if (process.argv.length == 5) {
    let bootstrap_ip = "localhost";
    let bootstrap_port = 3000;
    let ip = "localhost";
    console.log("Running local experiment with n: " + n + " capacity: " + capacity + " difficulty: " + difficulty);
    // spawn node0
    let id = 0;
    spawn_process(bootstrap_ip, bootstrap_port, ip, id, n, capacity, difficulty);
    // spawn remaining nodes with delay
    setTimeout(function(){
        spawn_nodes(bootstrap_ip, bootstrap_port, ip, n, capacity, difficulty);
    }, 10000);
} else {
    console.log("Arguments: n capacity difficulty");
}
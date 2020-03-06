REST=require("./rest.js")

var number_of_nodes = process.argv[2];
var capacity = process.argv[3];
var difficulty = process.argv[4];

var ip = "localhost";
var startport = 3000;

console.log("Running with number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
for (id=0; id<number_of_nodes; id++) {
    var port = startport + id;
    myapp = new REST(ip, port, id, capacity);
    myblock = myapp.node.create_block(0, 0, 1);
    console.log(myapp.node);
}

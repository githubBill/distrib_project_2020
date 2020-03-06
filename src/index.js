var number_of_nodes = process.argv[2];
var capacity = process.argv[3];
var difficulty = process.argv[4];

NODE=require("./node.js")

console.log("Running with number_of_nodes: " + number_of_nodes + " capacity: " + capacity + " difficulty: " + difficulty);
for (id=0; id<number_of_nodes; id++) {
    mynode = new NODE(id, capacity);
    myblock = mynode.create_block(0, 0, 1);
    console.log(myblock);
}

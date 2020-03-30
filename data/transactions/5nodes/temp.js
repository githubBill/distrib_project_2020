const fs = require('fs');

let id=0;
let file = fs.readFileSync('transactions'+id+'.txt', 'utf8');
let total_amount = 0;
const lines = file.split('\n');
for (let line of lines) {
    line = line.trim();
    if (line != "") {
        let [receiver_id, amount] = line.split(' ');
        receiver_id = parseInt(receiver_id.slice(2));
        amount = parseInt(amount);
        let transaction_to_create = {
            receiver_id: receiver_id,
            amount: amount
        };
        if (amount < 500 && receiver_id == 1) {
            total_amount += amount;
        }
    }
}

console.log(total_amount);
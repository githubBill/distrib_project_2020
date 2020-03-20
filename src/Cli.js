"use strict";

const readline = require('readline');

/**
 * @class Cli
 */
class Cli {
    constructor(node) {
        this.node = node;
        this.rl=null;
    }

    init() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let THIS = this;
        rl.setPrompt("node"+this.node.id+">");
        rl.prompt();
        rl.on('line', function(line) {
            console.log(line);
            if (line === "help") {
                console.log(THIS.cli_help());
            } else if (line === "balance") {
                console.log(THIS.node.show_balance());
            } else if (line === "view") {
                console.log(THIS.node.view_last_transactions());
            } else {
                let line_array = line.split(' ');
                if (line_array.length == 3) {
                    let receiver_id = parseInt(line_array[1]);
                    let amount = parseInt(line_array[2]);
                    if (line_array[0] == "t" &&
                        receiver_id >= 0 && receiver_id < THIS.node.n &&
                        amount > 0) {
                            THIS.node.create_transaction(THIS.node.contacts[receiver_id].publickey, amount);
                    } else {
                        console.log("Wrong command. Give help for command explanation");
                    }
                }
                else {
                    console.log("Wrong command. Give help for command explanation");
                }
            }
            rl.prompt();
        });
    }

    cli_help() {
        let help = `
        t <recipient_address> <amount>
        New transaction: Στείλε στο recipient_address wallet το ποσό amount από NBC coins που θα πάρει από
        το wallet sender_address. Θα καλεί συνάρτηση create_transaction στο backend που θα
        υλοποιεί την παραπάνω λειτουργία.<br/><br/>

        view
        View last transactions: Τύπωσε τα transactions που περιέχονται στο τελευταίο επικυρωμένο block του
        noobcash blockchain. Καλεί τη συνάρτηση view_transactions() στο backend που υλοποιεί την
        παραπάνω λειτουργία.<br/><br/>

        balance
        Show balance: Τύπωσε το υπόλοιπο του wallet.<br/><br/>

        help
        Επεξήγηση των παραπάνω εντολών.
        `;
        return help;
    }
}

module.exports = Cli;
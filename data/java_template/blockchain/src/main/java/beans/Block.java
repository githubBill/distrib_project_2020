package beans;


import entities.Blockchain;
import entities.Transaction;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Block class represents the basic part of the blockchain
 *
 * Implements the Serializable inteface in order to be sent above
 * network when a new miner joins the blockchain network
 */
public class Block implements Serializable {

                                       
    private String previousHash;
    private long timestamp;
    private String hash;
    private int nonce;
    private List<Transaction> transactions = new ArrayList<Transaction>();

    /*
     * todo:
     * Function that calculates the hash on the current block
     */
    public String calculateHash() throws Exception {

        return "";
    }

    /*
     * todo:
     * Function that adds a Transaction on the current block if it is valid
     */
    public boolean addTransaction(Transaction transaction, Blockchain blockchain) {

        return true;
    }

}

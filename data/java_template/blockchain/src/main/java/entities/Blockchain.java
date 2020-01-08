package entities;

import beans.Block;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Blockchain will be part a node-miner. It should be able to be sent to
 * a new miner joining the network
 */
public class Blockchain implements Serializable {

    private List<Block> blockchain;
    private int difficulty;
    private int maxTransactionInBlock;
    private HashMap<String,TransactionOutput> UTXOs = new HashMap<String,TransactionOutput>();
    private float minimumTransaction;


    /**
     * Method checking if the list of blocks contained in this object is
     * creates a valid blockchain
     *
     * @return True, if the blockchain is valid, else false
     */
    public boolean isValid() throws Exception {
        return true;
    }


}

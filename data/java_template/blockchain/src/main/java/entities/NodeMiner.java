package entities;

import beans.Block;
import beans.MessageType;
import threads.ClientThread;
import threads.ServerThread;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

/*
 * Class that represents a miner.
 */
public class NodeMiner {

    /*
     * todo : utility to mine a new Block
     */
    public void mineBlock() throws Exception {
    }

    /**
     * todo : Utility to initiliaze any network connections. Call upon start
     */
    public void initiliazeNetoworkConnections()  {
    }

    /**
     * Function adding a new transaction to blockchain
     * @param transaction
     * @param broadcast
     * @return whether the transaction was added or not
     */
    public boolean addTransactionToBlockchain(Transaction transaction, boolean broadcast) {
        return false;
    }

}

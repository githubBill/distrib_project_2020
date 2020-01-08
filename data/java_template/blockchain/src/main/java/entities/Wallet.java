package entities;

import java.io.Serializable;
import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Wallet implements Serializable {
    public static Logger LOGGER = Logger.getLogger(Wallet.class.getName());

    private PrivateKey privateKey;
    private PublicKey publicKey;

    public HashMap<String,TransactionOutput> UTXOs = new HashMap<String,TransactionOutput>(); //only UTXOs owned by this wallet.

    /**
     * Function generating a new Keypair of public and private key for this wallet
     */
    public void generateKeyPair() {
    }


    /**
     * Get the balance on this wallet
     * @param allUTXOs (unspent transactions)
     * @return the balance as float
     */
    public float getBalance(HashMap<String,TransactionOutput> allUTXOs) {
        return 0f;
    }

    /**
     * Return and creates a transaction from this wallet to a recipient knowing its public key
     * @param _recipient
     * @param value
     * @param allUTXOs
     * @return
     */
    public Transaction sendFunds(PublicKey _recipient, float value, HashMap<String,TransactionOutput> allUTXOs) {
        return null;
    }
}

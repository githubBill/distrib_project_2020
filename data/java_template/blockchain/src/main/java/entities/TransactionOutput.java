package entities;

import utilities.StringUtilities;

import java.io.Serializable;
import java.security.PublicKey;

public class TransactionOutput implements Serializable {

    public String id;
    public PublicKey reciepient; //also known as the new owner of these coins.
    public float value; //the amount of coins they own
    public String parentTransactionId; //the id of the transaction this output was created in


    //Check if coin belongs to you
    public boolean isMine(PublicKey publicKey) {
        return true;
    }


}

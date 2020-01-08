package utilities;

import entities.Transaction;

import java.security.*;
import java.util.ArrayList;import java.util.List;

public class StringUtilities {
    /**
     * Function that applies the hash function to a string
     * @param String input
     * @return the hash value
     */
    public static String applySha256(String input){
        return "";
    }


    //Applies ECDSA Signature and returns the result ( as bytes ).
    public static byte[] applyECDSASig(PrivateKey privateKey, String input) {
        return null;
    }

    //Verifies a String signature
    public static boolean verifyECDSASig(PublicKey publicKey, String data, byte[] signature) {
        return true;
    }


}

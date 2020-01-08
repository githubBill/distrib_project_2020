package threads;

import beans.Message;
import beans.MessageType;
import entities.NodeMiner;
import utilities.MessageUtilities;

import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ServerThread extends Thread {


    /**
     * Handle an incoming message
     * @param Message msg
     */
    private void handleMessage(Message msg) {
    }

    @Override
    public void run() {

    }
}

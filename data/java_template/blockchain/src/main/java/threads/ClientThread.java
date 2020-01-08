package threads;

import beans.Message;
import beans.MessageType;
import entities.NodeMiner;
import entities.Transaction;

import javax.sound.sampled.LineEvent;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ClientThread extends Thread {

    /**
     * Add data to sent to a Message object
     * @return the Message
     */
    private Message createMessage() {
        return null;
    }

    @Override
    public void run() {
    }
}

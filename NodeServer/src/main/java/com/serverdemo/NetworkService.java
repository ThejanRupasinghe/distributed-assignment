package com.serverdemo;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

//threadpool based implementation

public class NetworkService implements Runnable {
    private final DatagramSocket serverSocket;
    private final ExecutorService pool;

    public NetworkService(int port, int poolSize)
            throws IOException {
        serverSocket = new DatagramSocket(port);
        pool = Executors.newFixedThreadPool(poolSize);
    }

    public void run() { // run the service
        try {
            for (;;) {
                pool.execute(new Handler(serverSocket));
            }
        } catch (Exception ex) {
            pool.shutdown();
        }
    }
}

class Handler implements Runnable {
    private final DatagramSocket socket;
    Handler(DatagramSocket socket) { this.socket = socket; }
    public void run() {
        // read and service request on socket
        try {
            System.out.println("Start listening....");
            byte[] buf = new byte[256];

            // receive request
            DatagramPacket packet = new DatagramPacket(buf, buf.length);
            socket.receive(packet);

            System.out.println("recieved...");

            System.out.println(new String(packet.getData(), 0, packet.getLength()));

            // figure out response
            String dString = "testing123";

            buf = dString.getBytes();

            // send the response to the client at "address" and "port"
            InetAddress address = packet.getAddress();
            int port = packet.getPort();
            packet = new DatagramPacket(buf, buf.length, address, port);
            socket.send(packet);

        } catch (IOException e) {
            e.printStackTrace();

        }
    }
}
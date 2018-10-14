package com.serverdemo;

import java.io.IOException;
import java.net.*;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

//threadpool based implementation

public class NetworkService implements Runnable {
    private final DatagramSocket serverSocket;
    private final ExecutorService pool;
    public static final ExecutorService senderPool = Executors.newSingleThreadExecutor();

    public NetworkService(int port, int poolSize)
            throws IOException {
        serverSocket = new DatagramSocket(port);
        pool = Executors.newFixedThreadPool(poolSize);
    }

    public void run() { // run the service
        try {
            for (;;) {
                pool.execute(new ReceiveHandler(serverSocket));
            }
        } catch (Exception ex) {
            pool.shutdown();
        }
    }
}

class ReceiveHandler implements Runnable {
    private final DatagramSocket socket;
    byte[] buf = new byte[256];
    ReceiveHandler(DatagramSocket socket) { this.socket = socket; }
    public void run() {
        // read and service request on socket
        try {
            System.out.println("Start listening....");

            // receive request
            DatagramPacket packet = new DatagramPacket(buf, buf.length);
            socket.receive(packet);

            System.out.println("recieved...");

            System.out.println(new String(packet.getData(), 0, packet.getLength()));

            NetworkService.senderPool.submit(new SendHandler(packet));


        } catch (IOException e) {
            e.printStackTrace();

        }
    }
}


class SendHandler implements Runnable{

    private DatagramPacket packet;
    byte[] buf = new byte[256];

    public SendHandler(DatagramPacket packet){
        this.packet = packet;
    }
    public void run(){
        // get a datagram socket
        String dString = "testing123";
        System.out.println(dString);

        buf = dString.getBytes();

        // send the response to the client at "address" and "port"
        InetAddress address = packet.getAddress();
        int port = packet.getPort();
        packet = new DatagramPacket(buf, buf.length, address, port);

        DatagramSocket socket = null;
        try {
            socket = new DatagramSocket();
            socket.send(packet);
            System.out.println("packet sent");
        } catch (SocketException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            socket.close();
        }

    }
}
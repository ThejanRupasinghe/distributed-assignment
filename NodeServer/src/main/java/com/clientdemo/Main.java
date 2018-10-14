package com.clientdemo;

import java.io.IOException;
import java.net.*;

public class Main {
    public static void main(String[] args) throws IOException {

        new Parallel(1).start();
        new Parallel(2).start();
        new Parallel(3).start();
        new Parallel(4).start();
        new Parallel(5).start();
        new Parallel(6).start();
        new Parallel(7).start();
        new Parallel(8).start();
        new Parallel(9).start();
        new Parallel(10).start();


    }
}

class Parallel extends Thread{

    public int id;

    public Parallel(int id){
        this.id=id;
    }
    public void run(){
        // get a datagram socket
        DatagramSocket socket = null;
        try {
            socket = new DatagramSocket();
        } catch (SocketException e) {
            e.printStackTrace();
        }

        // send request
        byte[] buf = new byte[256];
        byte[] addr = {(byte)127,(byte)0, (byte)0,(byte)1};
        //byte[] addr = {127,0,0,1};

        InetAddress address = null;
        try {
            address = InetAddress.getByAddress(addr);
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }

        String dString = "sending    " + Integer.valueOf(id);

        byte[] sendBuf = dString.getBytes();

        DatagramPacket packet = new DatagramPacket(sendBuf, sendBuf.length, address, 4445);
        try {
            socket.send(packet);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // get response
        packet = new DatagramPacket(buf, buf.length);
        try {
            socket.receive(packet);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // display response
        String received = new String(packet.getData(), 0, packet.getLength());
        System.out.println("Quote of the Moment: " + received);

        socket.close();
    }
}


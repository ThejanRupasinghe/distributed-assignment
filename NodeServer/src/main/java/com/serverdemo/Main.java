package com.serverdemo;

import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        //new QuoteServerThread().start();
        new Thread(new NetworkService(4445,4)).start();
    }
}



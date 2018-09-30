package com;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public abstract class AbstractConnector {

	private Socket clientSocket;

	protected PrintWriter out;

	protected BufferedReader in;

	private static final Logger logger = LogManager.getLogger(AbstractConnector.class);

	public void startConnection(String ip, int port) throws Exception {
		clientSocket = new Socket(ip, port);

		//		clientSocket.bind(new InetSocketAddress("127.0.0.1",5050));
		//		clientSocket.connect(new InetSocketAddress(ip,port));

		out = new PrintWriter(clientSocket.getOutputStream(), true);
		in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

		logger.info("Socket Opened to " + ip + " : " + port);
	}

	public abstract String sendMessage(String message) throws Exception;

	public void stopConnection() throws Exception {
		in.close();
		out.close();
		clientSocket.close();

		logger.info("Stopped connection. Socket closed.");
	}

}

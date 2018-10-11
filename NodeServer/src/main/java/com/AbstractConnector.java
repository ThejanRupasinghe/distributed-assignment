package com;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public abstract class AbstractConnector {

	private Socket clientSocket = null;

	protected PrintWriter out = null;

	protected BufferedReader in = null;

	private static final Logger logger = LogManager.getLogger(AbstractConnector.class);

	public void startConnection(String ip, int port) throws UnknownHostException, IOException {
		//		clientSocket.bind(new InetSocketAddress("127.0.0.1",5050));
		//		clientSocket.connect(new InetSocketAddress(ip,port));

		clientSocket = new Socket(ip, port);
		out = new PrintWriter(clientSocket.getOutputStream(), true);
		in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

		logger.debug("Socket Opened to " + ip + " : " + port);
	}

	public abstract String sendMessage(String message);

	public void stopConnection() {
		try {
			if (in != null && out != null & clientSocket != null) {
				in.close();
				out.close();
				clientSocket.close();

				logger.debug("Stopped connection. Socket closed.");
			}
		}
		catch (IOException e) {
			e.printStackTrace();
		}

	}

}

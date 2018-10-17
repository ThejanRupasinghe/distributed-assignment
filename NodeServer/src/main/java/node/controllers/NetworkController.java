package node.controllers;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.SocketException;
import java.net.UnknownHostException;

public class NetworkController {

	/**
	 * Opens a datagram socket to any IP, Port and takes the Local IP
	 *
	 * @return Local IP of the connected network
	 */
	public static String getMyIP() {
		String ip = null;
		try (final DatagramSocket socket = new DatagramSocket()) {
			socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
			ip = socket.getLocalAddress().getHostAddress();
		}
		catch (SocketException e) {
			e.printStackTrace();
		}
		catch (UnknownHostException e) {
			e.printStackTrace();
		}

		return ip;
	}

	/**
	 * Checks a given port is acquired or not, by opening a TCP server socket and a Datagram socket
	 * to the same port.
	 *
	 * @param port int port number
	 * @return true if available, false otherwise
	 */
	public static boolean available(int port) {
		ServerSocket ss = null;
		DatagramSocket ds = null;
		try {
			ss = new ServerSocket(port);
			ss.setReuseAddress(true);
			ds = new DatagramSocket(port);
			ds.setReuseAddress(true);
			return true;
		}
		catch (IOException e) {
		}
		finally {
			if (ds != null) {
				ds.close();
			}

			if (ss != null) {
				try {
					ss.close();
				}
				catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return false;
	}

}

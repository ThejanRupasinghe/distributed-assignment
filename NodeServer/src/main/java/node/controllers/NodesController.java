package node.controllers;

import utils.Constants;
import utils.Utils;
import node.models.Node;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;

public class NodesController {

	private static final Logger logger = LogManager.getLogger(NodesController.class);

	/**
	 * Get the REG message that will be used to register the node with the BootstrapServer
	 *
	 * @param node Node to be registered
	 */
	public static String getRegNodeMessage(Node node) {
		StringBuilder sb = new StringBuilder(Constants.REG);
		sb.append(" ");
		sb.append(node.getIpAddr());
		sb.append(" ");
		sb.append(node.getPort());
		sb.append(" ");
		sb.append(node.getUsername());

		int lengthOfMessage = 5 + sb.length(); // 5 = 4 characters + space
		String regMessage = Utils.appendZeroesToNumber(lengthOfMessage) + " " + sb;
		return regMessage;
	}

	/**
	 * Get the UNREG message that will be used to unregister the node with the BootstrapServer
	 *
	 * @param node Node to be unregistered
	 */
	public static String getUnregNodeMessage(Node node) {
		StringBuilder sb = new StringBuilder(Constants.UNREG);
		sb.append(" ");
		sb.append(node.getIpAddr());
		sb.append(" ");
		sb.append(node.getPort());
		sb.append(" ");
		sb.append(node.getUsername());

		int lengthOfMessage = 5 + sb.length(); // 5 = 4 characters + space
		String unregMessage = Utils.appendZeroesToNumber(lengthOfMessage) + " " + sb;
		return unregMessage;
	}

	public static ArrayList<Node> parseRegNodeResponse(String response) {
		String[] strings = response.split(" ");
		int length = Integer.parseInt(strings[0]);
		String status = strings[1];
		logger.debug("Response length: " + length);
		logger.debug("Response status: " + status);

		ArrayList<Node> nodes = null;

		if(Constants.REGOK.equals(status)) {
			int noOfNodes = Integer.parseInt(strings[2]);
			switch (noOfNodes) {
				case 0:
					logger.info("Registration successful. No nodes registered in the system.");
					nodes = new ArrayList<>();
					break;
				case 9999:
					//				logger.error("Failed. There is some error in the command");
					logger.error("Registration failed. Entry already in the table.");
					break;
				case 9998:
					//				logger.error("Failed. Already registered to you. Unregister first.");
					logger.error("Registration failed. Invalid IP, Port or Username.");
					break;
				case 9997:
					//				logger.error("Failed. Registered to another user. Try a different IP and port");
					logger.error("Registration failed. Bootstrap table is full.");
					break;
				// no 9996 error code in C server
				case 9996:
					//				logger.error("Failed. Cannot register. BS full.");
					break;
				default:
					logger.info("Request is successful. Returning " + noOfNodes + " nodes.");

					nodes = new ArrayList<>();
					for (int i = 3; i <= noOfNodes * 3; i += 3) {
						String ipAddr = strings[i];
						int port = Integer.parseInt(strings[i + 1]);
						String userName = strings[i+2];
						Node node = new Node(ipAddr, port, userName);
						logger.debug(node.toString());
						nodes.add(node);
					}

					break;
			}
		} else if(Constants.ERROR.equals(status)){
			logger.error("Invalid Command.");
		}

		// returns null in any error
		return nodes;
	}
}

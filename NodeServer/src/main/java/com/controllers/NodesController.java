package com.controllers;

import com.Constants;
import com.Utils;
import com.models.Node;
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
        logger.info("Respose length: " + length);
        logger.info("Response status: " + status);

        ArrayList<Node> nodes = new ArrayList<>();
        int noOfNodes = Integer.parseInt(strings[2]);
        switch (noOfNodes) {
            case 0: {
                logger.info("Request is successful. No nodes registered in the system.");
            }
            break;
            case 1:
            case 2: {
                logger.info("Request is successful. Returning " + noOfNodes + " nodes.");
            }
            break;
            case 9999: {
                logger.error("Failed. There is some error in the command");
            }
            break;
            case 9998: {
                logger.error("Failed. Already registered to you. Unregister first.");
            }
            break;
            case 9997: {
                logger.error("Failed. Registered to another user. Try a different IP and port");
            }
            break;
            case 9996: {
                logger.error("Failed. Cannot register. BS full.");
            }
            break;
            default: {
                // pass
            }
        }

        for (int i = 0; i < noOfNodes; i += 2) {
            String ipAddr = strings[noOfNodes + i];
            int port = Integer.parseInt(strings[noOfNodes + i + 1]);
            Node node = new Node(ipAddr, port);
            nodes.add(node);
        }

        return nodes;
    }
}

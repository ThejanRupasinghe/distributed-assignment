package com.controllers;

import com.models.Node;

public class NodesController {
    /**
     * Get the REG message that will be used to register the node with the BootstrapServer
     *
     * @param node Node to be registered
     */
    public static String getRegNodeMessage(Node node) {
        StringBuilder sb = new StringBuilder("REG");
        sb.append(" ");
        sb.append(node.getIpAddr());
        sb.append(" ");
        sb.append(node.getPort());
        sb.append(" ");
        sb.append(node.getUsername());

        String lengthOfMessage = Integer.toString(5 + sb.length()); // 5 = 4 characters + space
        String regMessage = ("0000" + lengthOfMessage).substring(lengthOfMessage.length()) + " " + sb;
        return regMessage;
    }

    /**
     * Get the UNREG message that will be used to unregister the node with the BootstrapServer
     *
     * @param node Node to be unregistered
     */
    public static String getUnregNodeMessage(Node node) {
        StringBuilder sb = new StringBuilder("UNREG");
        sb.append(" ");
        sb.append(node.getIpAddr());
        sb.append(" ");
        sb.append(node.getPort());
        sb.append(" ");
        sb.append(node.getUsername());

        String lengthOfMessage = Integer.toString(5 + sb.length()); // 5 = 4 characters + space
        String unregMessage = ("0000" + lengthOfMessage).substring(lengthOfMessage.length()) + " " + sb;
        return unregMessage;
    }
}

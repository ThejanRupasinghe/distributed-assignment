package node.models;

public class Node {
    private String ipAddr;
    private int port;
    private String username;

    public Node(String ipAddr, int port, String username) {
        this.ipAddr = ipAddr;
        this.port = port;
        this.username = username;
    }

    public Node(String ipAddr, int port) {
        this.ipAddr = ipAddr;
        this.port = port;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "Node{" +
                "ipAddr=" + ipAddr +
                ", port=" + port +
                ", username='" + username + '\'' +
                '}';
    }

    public String getIpAddr() {
        return ipAddr;
    }

    public int getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }
}

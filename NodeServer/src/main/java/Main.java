import node.controllers.NodesController;
import node.models.Node;
import com.tcp.TCPConnector;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.ServerSocket;

public class Main {

    private static final Logger logger = LogManager.getLogger(Main.class);

    // TODO: 9/30/18 handle exceptions
    public static void main(String[] args) throws Exception{
        logger.info("Node Started.");

	    DatagramSocket serverSocket = new DatagramSocket(9090);
	    ServerSocket ss = new ServerSocket(9090);

        TCPConnector connector = new TCPConnector();
//        // to the hosted BS server
//		connector.startConnection("142.93.244.96", 9090);
//        // to the local BS server in C
        connector.startConnection("0.0.0.0", 9090);
//
        registerNodeExample(connector);
//
//
        connector.stopConnection();
    }

    private static void registerNodeExample(TCPConnector connector) throws Exception {
        Node node = new Node("129.82.123.45", 5001, "1234abcd");
        String regMessage = NodesController.getRegNodeMessage(node);
        logger.info("RegNodeMessage: " + regMessage);

        String response = connector.sendMessage(regMessage);
        logger.info("Response Received: " + response);
        // TODO: 9/30/18 parse the response
    }

    private static void unregisterNodeExample(TCPConnector connector) throws Exception {
        Node node = new Node("129.82.123.45", 5001, "1234abcd");
        String unregMessage = NodesController.getUnregNodeMessage(node);
        logger.info("UnregNodeMessage: " + unregMessage);

        String response = connector.sendMessage(unregMessage);
        logger.info("Response Received: " + response);
        // TODO: 9/30/18 parse the response
    }
}

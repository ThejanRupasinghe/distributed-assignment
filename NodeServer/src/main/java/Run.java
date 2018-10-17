import java.util.ArrayList;

import node.Server;
import node.controllers.NetworkController;
import node.controllers.NodesController;
import node.models.Node;
import com.tcp.TCPConnector;
import utils.Configuration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import utils.Utils;

public class Run {

	private static final Logger logger = LogManager.getLogger(Run.class);

	private static String configFile = "config.yml";

	// TODO: 9/30/18 handle exceptions
	public static void main(String[] args) {
		logger.info("Node Started.");

		//ClassLoader classLoader = ClassLoader.getSystemClassLoader();
		//String filePath = classLoader.getResource(configFile).getPath();

		// takes config.yml file path
		String filePath = "/" + configFile;

		// starting procedure of a new server
		Server server = new Server(filePath);
		server.configure();

		if(server.getConfiguration()!=null){
			if(server.bootstrap()){
				while (true){

				}
			}
		}
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

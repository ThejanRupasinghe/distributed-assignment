import java.util.ArrayList;

import node.controllers.NetworkController;
import node.controllers.NodesController;
import node.models.Node;
import com.tcp.TCPConnector;
import utils.Configuration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import utils.Utils;

public class Main {

	private static final Logger logger = LogManager.getLogger(Main.class);

	private static String configFile = "config.yml";

	// TODO: 9/30/18 handle exceptions
	public static void main(String[] args) {
		logger.info("Node Started.");

		// takes config.yml file path
		//		ClassLoader classLoader = ClassLoader.getSystemClassLoader();
		//		String filePath = classLoader.getResource(configFile).getPath();
		String filePath = "/" + configFile;

		// loads configuration
		Configuration config = Configuration.getConfiguration(filePath);

		if (config != null) {
			logger.info("Configuration loaded.");
			logger.info("Bootstrap Server IP: " + config.getBsIP() + ", Port: " + config.getBsPort());

			// get the IP of the connected node
			String myIP = NetworkController.getMyIP();

			// take random port numbers until available
			int myPort = Utils.randPort();
			while (!NetworkController.available(myPort)) {
				myPort = Utils.randPort();
			}

			// take username
			String myUserName = Utils.generateUsername();

			Node myNode = new Node(myIP, myPort, myUserName);
			logger.info("My Node : " + myNode.toString());

			// register message
			String regMessage = NodesController.getRegNodeMessage(myNode);

			// start TCP connection to the BS
			TCPConnector connector = new TCPConnector();
			try {
				connector.startConnection(config.getBsIP(), config.getBsPort());
				// take response and parse
				String regResponse = connector.sendMessage(regMessage);
				ArrayList<Node> nodes = NodesController.parseRegNodeResponse(regResponse);

				// only same entry error is handled.
				while (nodes == null) {
					// if same entry generate new username
					myUserName = Utils.generateUsername();
					myNode.setUsername(myUserName);

					regResponse = connector.sendMessage(regMessage);
					nodes = NodesController.parseRegNodeResponse(regResponse);
				}

				// stop TCP connection to BS
				connector.stopConnection();

			}
			catch (Exception e) {
				logger.error("Error in connecting to Bootstrap Server.");
				e.printStackTrace();
			}

		} else {
			logger.error("Failed to load Configurations.");
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

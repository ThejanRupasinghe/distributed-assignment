package node;

import java.util.ArrayList;

import com.tcp.TCPConnector;
import node.controllers.NetworkController;
import node.controllers.NodesController;
import node.models.Node;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import utils.Configuration;
import utils.Utils;

public class Server {

	private String configFilePath;

	private Configuration configuration;

	private Node myNode;

	// stores the nodes given in bootstrapping
	private ArrayList<Node> givenNodes;

	private static final Logger logger = LogManager.getLogger(Server.class);

	public Server(String filePath) {
		this.configFilePath = filePath;

		// add a shutdown hook for graceful departure of the node
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			try {
				this.shutdown();
			}
			catch (Exception e) {
				e.printStackTrace();
			}
		}));
	}

	/**
	 * Gracefully shutdowns the node.
	 */
	public void shutdown() {
		logger.info("Node is shutting down gracefully....");

		// TODO: 10/13/18 Unregister from BS, send msgs to neighbours
	}

	/**
	 * Sends REG msg to the bootstrap server. Changes username if the entry is already there.
	 *
	 * @return true on success bootstrap, false otherwise
	 */
	public boolean bootstrap() {
		// register message
		String regMessage = NodesController.getRegNodeMessage(myNode);

		// start TCP connection to the BS
		TCPConnector connector = new TCPConnector();
		try {
			connector.startConnection(configuration.getBsIP(), configuration.getBsPort());
			// take response and parse
			String regResponse = connector.sendMessage(regMessage);
			givenNodes = NodesController.parseRegNodeResponse(regResponse);

			// only same entry error is handled.
			while (givenNodes == null) {
				// if same entry generate new username
				String newUserName = Utils.generateUsername();
				myNode.setUsername(newUserName);

				connector.startConnection(configuration.getBsIP(), configuration.getBsPort());
				regResponse = connector.sendMessage(regMessage);
				givenNodes = NodesController.parseRegNodeResponse(regResponse);
			}

			// stop TCP connection to BS
			connector.stopConnection();

			return true;

		}
		catch (Exception e) {
			logger.error("Error in connecting to Bootstrap Server.");
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * Starts server listener.
	 */
	public void startLitening() {
		// TODO: 10/13/18 Implement listening on the selected port
	}

	/**
	 * Adds the two neighbours given from the bootstrap server.
	 */
	public void addNeighbours() {

	}

	/**
	 * Loads configuration from the file.
	 * Picks IP, Port and Username
	 */
	public void configure() {
		// loads configuration
		configuration = Configuration.getConfiguration(configFilePath);

		if (configuration != null) {
			logger.info("Configuration loaded.");
			logger.info("Bootstrap Server IP: " + configuration.getBsIP() + ", Port: " + configuration.getBsPort());

			// get the IP of the connected node
			String myIP = NetworkController.getMyIP();

			// take random port numbers until available
			int myPort = Utils.randPort();
			while (!NetworkController.available(myPort)) {
				myPort = Utils.randPort();
			}

			// take username
			String myUserName = Utils.generateUsername();

			myNode = new Node(myIP, myPort, myUserName);
			logger.info("My Node : " + myNode.toString());

		} else {
			logger.error("Failed to load Configurations.");
		}
	}

	public String getConfigFilePath() {
		return configFilePath;
	}

	public Configuration getConfiguration() {
		return configuration;
	}

	public Node getMyNode() {
		return myNode;
	}
}

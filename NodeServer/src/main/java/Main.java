import com.tcp.TCPConnector;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Main {

	private static final Logger logger = LogManager.getLogger(Main.class);

	// TODO: 9/30/18 handle exceptions 
	public static void main(String[] args) throws Exception {

		logger.info("Node Started.");

		TCPConnector connector = new TCPConnector();
		// to the hosted BS server
//		connector.startConnection("142.93.244.96", 55555);
		// to the local BS server in C
		connector.startConnection("0.0.0.0", 5000);

		// TODO: 9/30/18 to be generated 
		String connectMessage = "0036 REG 129.82.123.45 5001 1234abcd";
		logger.info("Message Prepared : " + connectMessage);
		
		
		String response = connector.sendMessage(connectMessage);
		logger.info("Response Received : " + response);
		// TODO: 9/30/18 parse the response 
		
		connector.stopConnection();
	}
}

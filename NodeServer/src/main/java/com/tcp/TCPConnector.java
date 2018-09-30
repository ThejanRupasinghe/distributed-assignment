package com.tcp;

import com.AbstractConnector;
import com.udp.UDPConnector;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class TCPConnector extends AbstractConnector {

	private static final Logger logger = LogManager.getLogger(TCPConnector.class);

	@Override
	public String sendMessage(String outMessage) throws Exception {
		out.println(outMessage);

		logger.info(outMessage + " wrote to the Socket out.");

		// array with more space than chars in message
		// TODO: 9/30/18 read length first and set the array size
		char[] chars = new char[8192];
		int read = in.read(chars);
		String inMesssage = String.valueOf(chars, 0, read);

		logger.info(inMesssage + " read from the Socket in.");

		return inMesssage;
	}

}

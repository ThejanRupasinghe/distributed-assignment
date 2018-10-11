package utils;

import java.util.UUID;

public class Utils {

	/**
	 * Appends zeros to the end beginning of the input
	 *
	 * @param input (should consist of 4 or fewer characters)
	 * @return input with zeros appended to the beginning (length of output = 4)
	 */
	public static String appendZeroesToNumber(int input) {
		return ("0000" + input).substring(Integer.toString(input).length());
	}

	/**
	 * Generates random integer of length 4 to be assigned as the port number
	 *
	 * @return length 4 random int
	 */
	public static int randPort() {
		return Math.round((float) (Math.random() * 10000));
	}

	/**
	 * Generates alpha numeric string of length 8 to be assigned as the node username
	 *
	 * @return length 8 alpha numeric string
	 */
	public static String generateUsername() {
		String uuid = UUID.randomUUID().toString();
		uuid = uuid.split("-")[0];

		return uuid;
	}

	// TODO: 10/8/18 methods to generate random -> message IDs
}

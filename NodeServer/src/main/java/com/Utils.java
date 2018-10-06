package com;

public class Utils {
    /**
     * Append zeros to the end beginning of the input
     * @param input (should consist of 4 or fewer characters)
     * @return input with zeros appended to the beginning (length of output = 4)
     */
    public static String appendZeroesToNumber(int input) {
        return ("0000" + input).substring(Integer.toString(input).length());
    }
}

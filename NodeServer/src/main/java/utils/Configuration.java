package utils;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.yaml.snakeyaml.Yaml;

public final class Configuration {

	private String bsIP;

	private int bsPort;

	public String getBsIP() {
		return bsIP;
	}

	public void setBsIP(String bsIP) {
		this.bsIP = bsIP;
	}

	public int getBsPort() {
		return bsPort;
	}

	public void setBsPort(int bsPort) {
		this.bsPort = bsPort;
	}

	public static Configuration getConfiguration(String filePath) {
		Yaml yaml = new Yaml();

		try {
		InputStream in = Configuration.class.getResourceAsStream(filePath);
		InputStreamReader ir = new InputStreamReader(in);
		Configuration config = yaml.loadAs(ir, Configuration.class);
		return config;
		}
		catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}

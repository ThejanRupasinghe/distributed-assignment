package utils;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

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
		try (InputStream in = new FileInputStream(filePath)) {
			Configuration config = yaml.loadAs(in, Configuration.class);
			return config;
		}
		catch (FileNotFoundException e) {
			e.printStackTrace();
			return null;
		}
		catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}
}

package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.File;
import java.nio.file.Paths;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // Debug: Print current working directory
        System.out.println("Current working directory: " + System.getProperty("user.dir"));
        
        // Get the absolute path to .env file
        String currentDir = System.getProperty("user.dir");
        String envDirectory = Paths.get(currentDir, "server", "demo").toString();
        String envFilePath = Paths.get(envDirectory, ".env").toString();
        
        File envFile = new File(envFilePath);
        System.out.println(".env file exists: " + envFile.exists());
        System.out.println(".env file absolute path: " + envFile.getAbsolutePath());
        
        // Load .env with absolute path
        Dotenv dotenv = Dotenv.configure()
                .directory(envDirectory)  // Use absolute directory path
                .filename(".env")
                .ignoreIfMissing()
                .load();

        // Set as System properties so Spring Boot can access them
        String dbUrl = dotenv.get("MYSQL_FINAPP");
        String dbUser = dotenv.get("MYSQL_USERNAME");
        String dbPass = dotenv.get("MYSQL_PASSWORD");

        // Debug: Print loaded values
        System.out.println("Loaded DB URL: " + dbUrl);
        System.out.println("Loaded DB User: " + dbUser);
        System.out.println("Loaded DB Pass: " + (dbPass != null ? "***HIDDEN***" : "null"));

        if (dbUrl != null)
            System.setProperty("MYSQL_FINAPP", dbUrl);
        else
            System.out.println("Warning: MYSQL_FINAPP is not set in .env");

        if (dbUser != null)
            System.setProperty("MYSQL_USERNAME", dbUser);
        else
            System.out.println("Warning: MYSQL_USERNAME is not set in .env");

        if (dbPass != null)
            System.setProperty("MYSQL_PASSWORD", dbPass);
        else
            System.out.println("Warning: MYSQL_PASSWORD is not set in .env");

        SpringApplication.run(DemoApplication.class, args);
    }

}

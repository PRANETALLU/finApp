package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		// Load .env
        Dotenv dotenv = Dotenv.configure()
                              .filename(".env") // Optional if your file is named `.env`
                              .ignoreIfMissing()
                              .load();

        // Set as System properties so Spring Boot can access them
        System.setProperty("MYSQL_FINAPP", dotenv.get("MYSQL_FINAPP"));
        System.setProperty("MYSQL_USERNAME", dotenv.get("MYSQL_USERNAME"));
        System.setProperty("MYSQL_PASSWORD", dotenv.get("MYSQL_PASSWORD"));

		SpringApplication.run(DemoApplication.class, args);
	}

}

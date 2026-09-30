package com.farukfashion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableAsync
@EnableScheduling
public class FarukFashionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarukFashionApplication.class, args);
        System.out.println("========================================");
        System.out.println("  FARUK FASHION Backend Started");
        System.out.println("  Style That Speaks");
        System.out.println("========================================");
    }
}

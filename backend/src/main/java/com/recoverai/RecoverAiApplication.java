package com.recoverai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RecoverAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecoverAiApplication.class, args);
    }
}

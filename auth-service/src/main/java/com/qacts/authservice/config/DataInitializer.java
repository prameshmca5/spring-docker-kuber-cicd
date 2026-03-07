package com.qacts.authservice.config;

import com.qacts.authservice.entity.User;
import com.qacts.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                        "admin",
                        "admin@admin.com",
                        passwordEncoder.encode("admin"),
                        "ROLE_ADMIN");
                userRepository.save(admin);
                log.info("✅ Default admin user created: username=admin, password=admin");
            } else {
                log.info("ℹ️ Admin user already exists, skipping seeding.");
            }
        };
    }
}

package com.doms.doms.config;

import com.doms.doms.entity.Role;
import com.doms.doms.entity.User;
import com.doms.doms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Create Admin
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {

            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .build();
//changes
            userRepository.save(admin);

            System.out.println("✅ Admin Created");
        }

        // Create User
        if (userRepository.findByEmail("user@gmail.com").isEmpty()) {

            User user = User.builder()
                    .fullName("Demo User")
                    .email("user@gmail.com")
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.ROLE_USER)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);

            System.out.println("✅ User Created");
        }
    }
}
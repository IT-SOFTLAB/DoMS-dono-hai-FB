package com.doms.doms.controller;

import com.doms.doms.dto.UpdateUserRequest;
import com.doms.doms.dto.UserResponse;
import com.doms.doms.service.UserService;
import com.doms.doms.dto.ChangePasswordRequest;
import com.doms.doms.entity.User;
import com.doms.doms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.doms.doms.dto.UserSummary;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Logged-in User Profile
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {

        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    // Update Logged-in User Profile
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                userService.updateCurrentUser(request)
        );
    }

    @GetMapping("/directory")
    public ResponseEntity<List<UserSummary>> directory(@RequestParam(defaultValue = "") String query) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String term = query.trim().toLowerCase();
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(User::isEnabled).filter(user -> user.getRole() != com.doms.doms.entity.Role.ROLE_ADMIN)
                .filter(user -> !user.getEmail().equalsIgnoreCase(currentEmail))
                .filter(user -> term.isBlank() || user.getFullName().toLowerCase().contains(term) || user.getEmail().toLowerCase().contains(term))
                .map(user -> new UserSummary(user.getId(), user.getFullName(), user.getEmail())).toList());
    }
    @PutMapping("/change-password") public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request){User u=userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();if(!passwordEncoder.matches(request.getCurrentPassword(),u.getPassword()))throw new RuntimeException("Current password is incorrect");if(request.getNewPassword()==null||request.getNewPassword().length()<8)throw new RuntimeException("New password must be at least 8 characters");u.setPassword(passwordEncoder.encode(request.getNewPassword()));userRepository.save(u);return ResponseEntity.ok("Password updated");}
}

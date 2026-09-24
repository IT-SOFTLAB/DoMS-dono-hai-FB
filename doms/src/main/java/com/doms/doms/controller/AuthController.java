package com.doms.doms.controller;

import com.doms.doms.dto.LoginRequest;
import com.doms.doms.dto.LoginResponse;
import com.doms.doms.dto.RegisterRequest;
import com.doms.doms.service.AuthService;
import com.doms.doms.dto.OtpRequest;
import com.doms.doms.dto.OtpPasswordResetRequest;
import com.doms.doms.serviceImpl.PasswordOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;
    private final PasswordOtpService passwordOtpService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password/request-otp")
    public ResponseEntity<String> requestPasswordOtp(@RequestBody OtpRequest request) {
        passwordOtpService.send(request.email());
        return ResponseEntity.ok("Verification code sent to your email.");
    }

    @PostMapping("/password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody OtpPasswordResetRequest request) {
        passwordOtpService.reset(request.email(), request.otp(), request.newPassword());
        return ResponseEntity.ok("Password changed successfully.");
    }
}

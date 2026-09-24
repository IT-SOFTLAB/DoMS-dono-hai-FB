package com.doms.doms.serviceImpl;

import com.doms.doms.entity.User;
import com.doms.doms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PasswordOtpService {
    private record OtpEntry(String hash, Instant expiresAt, int attempts) {}
    private final ConcurrentHashMap<String, OtpEntry> otps = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JavaMailSender mailSender;
    @Value("${app.mail.from:}") private String from;
    @Value("${app.otp.expiry-minutes:10}") private long expiryMinutes;

    public void send(String rawEmail) {
        String email = normalize(rawEmail);
        User user = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("No active account was found for this email."));
        if (!user.isEnabled()) throw new IllegalArgumentException("This account is disabled.");
        String otp = String.format("%06d", random.nextInt(1_000_000));
        otps.put(email, new OtpEntry(encoder.encode(otp), Instant.now().plusSeconds(expiryMinutes * 60), 0));
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) message.setFrom(from);
        message.setTo(email);
        message.setSubject("DOMS password verification code");
        message.setText("Your DOMS verification code is " + otp + ". It expires in " + expiryMinutes + " minutes. If you did not request this, ignore this email.");
        mailSender.send(message);
    }

    public void reset(String rawEmail, String otp, String newPassword) {
        String email = normalize(rawEmail);
        if (newPassword == null || newPassword.length() < 8) throw new IllegalArgumentException("New password must be at least 8 characters.");
        OtpEntry entry = otps.get(email);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) { otps.remove(email); throw new IllegalArgumentException("The verification code has expired. Request a new code."); }
        if (entry.attempts() >= 5) { otps.remove(email); throw new IllegalArgumentException("Too many invalid attempts. Request a new code."); }
        if (otp == null || !encoder.matches(otp.trim(), entry.hash())) {
            otps.put(email, new OtpEntry(entry.hash(), entry.expiresAt(), entry.attempts() + 1));
            throw new IllegalArgumentException("Invalid verification code.");
        }
        User user = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Account not found."));
        user.setPassword(encoder.encode(newPassword));
        users.save(user);
        otps.remove(email);
    }

    private String normalize(String email) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email is required.");
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

package com.doms.doms.dto;
public record OtpPasswordResetRequest(String email, String otp, String newPassword) {}

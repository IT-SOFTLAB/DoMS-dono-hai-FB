package com.doms.doms.service;

import com.doms.doms.dto.LoginRequest;
import com.doms.doms.dto.LoginResponse;
import com.doms.doms.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
    void logout();
}

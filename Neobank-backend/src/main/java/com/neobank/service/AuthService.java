package com.neobank.service;

import com.neobank.dto.LoginRequest;
import com.neobank.dto.LoginResponse;
import com.neobank.dto.RegisterRequest;

public interface AuthService {
    LoginResponse authenticate(LoginRequest request);

    void registerUser(RegisterRequest request);
}

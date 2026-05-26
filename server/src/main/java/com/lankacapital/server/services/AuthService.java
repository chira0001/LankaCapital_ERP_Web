package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;

public interface AuthService {
    EmployeeResponseDto signUp(SignUpRequest signUpRequest);
    JwtAuthenticationResponse signIn(SignInRequest signInRequest);
    JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
}

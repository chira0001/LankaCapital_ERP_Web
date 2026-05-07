package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.JwtAuthenticationResponse;
import com.lankacapital.server.dtos.RefreshTokenRequest;
import com.lankacapital.server.dtos.SignInRequest;
import com.lankacapital.server.dtos.SignUpRequest;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.services.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/v1/auth")
public class AuthController {

    private AuthService authService;

    @PostMapping(path = "/register")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest signUpRequest){
        return ResponseEntity.ok(authService.signUp(signUpRequest));
    }

    @PostMapping(path = "/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@RequestBody SignInRequest signInRequest){
        return ResponseEntity.ok(authService.signIn(signInRequest));
    }

    @PostMapping(path = "/refresh")
    public ResponseEntity<JwtAuthenticationResponse> refresh(@RequestBody RefreshTokenRequest refreshTokenRequest){
        return ResponseEntity.ok(authService.refreshToken(refreshTokenRequest));
    }

}

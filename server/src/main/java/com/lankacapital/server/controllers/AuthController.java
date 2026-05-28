package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.JwtAuthenticationResponse;
import com.lankacapital.server.dtos.RefreshTokenRequest;
import com.lankacapital.server.dtos.SignInRequest;
import com.lankacapital.server.dtos.SignUpRequest;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/v1/auth")
public class AuthController {

    private AuthService authService;

    @PostMapping(path = "/register")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest signUpRequest){
        return new ResponseEntity<>(authService.signUp(signUpRequest), HttpStatus.CREATED);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@RequestBody SignInRequest signInRequest,
                                                           HttpServletResponse response){
        JwtAuthenticationResponse jwtResponse = authService.signIn(signInRequest);
        Cookie cookie = new Cookie(
                "refreshToken",
                jwtResponse.getRefreshToken()
        );
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);
        jwtResponse.setRefreshToken(null);

        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping(path = "/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken")
            String refreshToken
    ){
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

}

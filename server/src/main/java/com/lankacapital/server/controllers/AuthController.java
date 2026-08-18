package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.dtos.JwtAuthenticationResponse;
import com.lankacapital.server.dtos.SignInRequest;
import com.lankacapital.server.dtos.SignUpRequest;
import com.lankacapital.server.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

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
                                                           HttpServletRequest request,
                                                           HttpServletResponse response){
        JwtAuthenticationResponse jwtResponse = authService.signIn(signInRequest);
        boolean secureCookie = isSecureRequest(request);
        // set HttpOnly refresh cookie with SameSite=None so browser will send it on cross-site requests
        ResponseCookie cookie = ResponseCookie.from("refreshToken", jwtResponse.getRefreshToken())
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .sameSite(secureCookie ? "None" : "Lax")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        jwtResponse.setRefreshToken(null);

        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping(path = "/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false)
            String refreshToken
    ){
        if (refreshToken == null || refreshToken.isEmpty()){
            Map<String, Object> error = new HashMap<>();
            error.put("status", HttpStatus.UNAUTHORIZED.value());
            error.put("message", "Refresh token not provided");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        System.out.println("refresh 51 : " + refreshToken);
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping(path = "/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        boolean secureCookie = isSecureRequest(request);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .sameSite(secureCookie ? "None" : "Lax")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().build();
    }
    private boolean isSecureRequest(HttpServletRequest request) {
        return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }
}

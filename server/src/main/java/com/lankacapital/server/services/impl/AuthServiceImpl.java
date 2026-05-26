package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.EmployeeMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.services.AuthService;
import com.lankacapital.server.services.JWTService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    @Override
    public EmployeeResponseDto signUp(SignUpRequest signUpRequest) {
        Long id;
        System.out.println("31 : " + signUpRequest);
//        try{
//            id = Long.parseLong(signUpRequest.getId());
//        } catch (NumberFormatException e) {
//            throw new NumberFormatException("Enter valid employee id");
//        }
//        System.out.println("37 : " + id);
        if(employeeRepository.existsByEmail(signUpRequest.getEmail())){
            throw new ResourceExistException("Employee already registered with email : " + signUpRequest.getEmail());
        }

//        if (employeeRepository.existsByEmail(signUpRequest.getEmail())){
//            throw new ResourceExistException("User already exists with email : " + signUpRequest.getEmail());
//        }

        Employee employee = new Employee();

//        employee.setId(id);
        employee.setFirstName(signUpRequest.getFirstName());
        employee.setLastName(signUpRequest.getLastName());
        employee.setEmail(signUpRequest.getEmail());
        employee.setAddress("Default");
        employee.setPhoneNumber(signUpRequest.getPhoneNumber());
        employee.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        System.out.println("54 : " + employee);

        return EmployeeMapper.mapToEmployeeResponseDto(employeeRepository.save(employee));
    }

    @Override
    public JwtAuthenticationResponse signIn(SignInRequest signInRequest) {

        if(!employeeRepository.existsByEmail(signInRequest.getUsername())){
            throw new ResourceNotFoundException("Employee not found with username : "+signInRequest.getUsername());
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signInRequest.getUsername(),
                        signInRequest.getPassword()
                )
        );
        var employee = employeeRepository.findByEmail(signInRequest.getUsername());
        if(employee == null){
            throw new ResourceNotFoundException("Employee not found with username : " + signInRequest.getUsername());
        }

        var jwt = jwtService.generateToken(employee);
        var refreshToken = jwtService.generateRefreshToken(new HashMap<>(), employee);
        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();
        jwtAuthenticationResponse.setToken(jwt);
        jwtAuthenticationResponse.setRefreshToken(refreshToken);
        jwtAuthenticationResponse.setRole(employee.getRole().getRoleName());
        return jwtAuthenticationResponse;
    }

    @Override
    public JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String userEmail = jwtService.extractUserName(refreshTokenRequest.getToken());
        System.out.println("Username : " + userEmail);
        Employee employee = employeeRepository.findByEmail(userEmail);
        if(employee == null){
            throw new ResourceNotFoundException("User not found with : " + userEmail);
        }

        if(jwtService.isTokenValid(refreshTokenRequest.getToken(), employee)){
            var jwt = jwtService.generateToken(employee);
            JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();
            jwtAuthenticationResponse.setToken(jwt);
            jwtAuthenticationResponse.setRefreshToken(refreshTokenRequest.getToken());
            return jwtAuthenticationResponse;
        }
        return null;
    }
}

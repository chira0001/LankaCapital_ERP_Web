package com.lankacapital.server.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceExistException.class)
    public ResponseEntity<Map<String,Object>> handleResourceExistException(ResourceExistException resourceExistException){

        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.CONFLICT.value());
        error.put("message",resourceExistException.getMessage());

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException (ResourceNotFoundException resourceNotFoundException){

        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.NOT_FOUND.value());
        error.put("message", resourceNotFoundException.getMessage());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<Map<String, Object>> handleNumberFormatException (NumberFormatException numberFormatException){

        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", numberFormatException.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PasswordUpdateException.class)
    public ResponseEntity<Map<String, Object>> handlePasswordUpdateException (PasswordUpdateException passwordUpdateException){

        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", passwordUpdateException.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

}

package com.lankacapital.server.exceptions;

public class PasswordUpdateException extends RuntimeException {
    public PasswordUpdateException(String message) {
        super(message);
    }
}
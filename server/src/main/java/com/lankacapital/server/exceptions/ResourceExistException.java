package com.lankacapital.server.exceptions;

public class ResourceExistException extends RuntimeException{
    public ResourceExistException(String message) {
        super(message);
    }
}

package com.lankacapital.server.utils;

import java.util.UUID;

public class UtilityFunctions {
    public static boolean isValidUUID(String value) {
        try {
            UUID.fromString(value);
            return true;
        } catch (IllegalArgumentException | NullPointerException e) {
            return false;
        }
    }
}

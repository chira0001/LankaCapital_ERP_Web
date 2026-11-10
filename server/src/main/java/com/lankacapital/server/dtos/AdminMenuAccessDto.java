package com.lankacapital.server.dtos;

import java.util.List;

public record AdminMenuAccessDto(boolean superAdmin, List<String> permissions) {
}
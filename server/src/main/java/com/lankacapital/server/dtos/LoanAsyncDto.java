package com.lankacapital.server.dtos;

import lombok.Data;

import java.util.List;

@Data
public class LoanAsyncDto {
    private List<String> file_number;
}

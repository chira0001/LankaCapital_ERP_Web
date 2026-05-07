package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class LoanActionDto {
    private String fileNumber;
    private String rejectionNote;
    private Long employeeId;
}

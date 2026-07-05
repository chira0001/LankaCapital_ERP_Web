package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoanResAsyncDto {
    private String file_number;
    private BigDecimal amount;
    private LocalDateTime created_at;
    private BigDecimal document_charge;
    private String rejection_note;
    private String status;
    private Long customer_id;
    private Long employee_id;
    private Integer installment_id;
    private Integer interest_rate_id;
    private Long update_status;
}

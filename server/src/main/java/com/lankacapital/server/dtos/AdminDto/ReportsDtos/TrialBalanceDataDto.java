package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import com.lankacapital.server.enums.AccountType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TrialBalanceDataDto {

    private String accountName;
    private BigDecimal amount;
    private String transactionType;
    private AccountType accountType;
    private LocalDate financialDate;

}

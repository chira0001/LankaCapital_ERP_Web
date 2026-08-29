package com.lankacapital.server.entities.reports;

import com.lankacapital.server.enums.AccountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "trialBalance")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TrialBalanceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String accountName;

    private BigDecimal amount;

    private String transactionType;

    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    private LocalDate financialDate;
}

package com.lankacapital.server.entities;

import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Entity
@Table(name = "loans")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Loan {

    @Id
    private String fileNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "interest_rate_id")
    private InterestRate interestRate;

    @Column(precision = 12, scale = 2)
    private BigDecimal documentCharge = BigDecimal.valueOf(0);

    @ManyToOne
    @JoinColumn(name = "installment_id")
    private Installment installment;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP()")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private RiskLevel risk;

    @Enumerated(EnumType.STRING)
    private LoanStatus status=LoanStatus.PENDING;

    @Column(length = 1000)
    private String decisionNote;

    private Long updateStatus = 0L;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Employee approvedEmployee;


    @PrePersist
    public void update(){
        this.createdAt = LocalDateTime.now();
        if(this.fileNumber == null){
            this.fileNumber = UUID.randomUUID().toString();
        }
        this.status = LoanStatus.PENDING;
    }
}

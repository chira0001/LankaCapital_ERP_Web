package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private Customer customerId;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    private Double interestRate;

    @Column(precision = 12, scale = 2)
    private BigDecimal documentCharge;

    @ManyToOne
    @JoinColumn(name = "no_of_installments")
    private Installment numberOfInstallments;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP()")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employeeId;

    @PrePersist
    public void update(){
        this.createdAt = LocalDateTime.now();
    }
}

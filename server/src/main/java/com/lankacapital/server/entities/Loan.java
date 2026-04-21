package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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

    private Long amount;

    private Double interestRate;

    private Double documentCharge;

    @ManyToOne
    @JoinColumn(name = "no_of_installments")
    private Installment numberOfInstallments;

    @OneToMany(mappedBy = "fileNumber")
    private List<DailyCollection> dailyCollections;

}

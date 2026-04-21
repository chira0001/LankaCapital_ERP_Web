package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "installments")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Installment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Double id;

    @Column(nullable = false, unique = true)
    private Integer value;

    @OneToMany(mappedBy = "numberOfInstallments")
    private List<Loan> loans;

}

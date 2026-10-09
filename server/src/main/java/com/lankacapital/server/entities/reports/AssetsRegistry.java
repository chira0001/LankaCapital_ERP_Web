package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class AssetsRegistry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String assetName;
    private LocalDate purchasedDate;
    private LocalDate depreciatedDate;
    private Double rate;
    private BigDecimal amount;
}

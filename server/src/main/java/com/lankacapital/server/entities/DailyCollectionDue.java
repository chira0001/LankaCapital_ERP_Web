package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "daily_collection_dues")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyCollectionDue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "daily_collection_id")
    private DailyCollection dailyCollectionId;

    @ManyToOne
    @JoinColumn(name = "loan_id")
    private Loan loanId;

    @Column(precision = 12, scale = 2)
    private BigDecimal dueAmount;

}

package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_collections")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DailyCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "file_number")
    private Loan loan;

    private Integer installmentNumber;

    @Column(precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime paidAt;

    @ManyToOne
    @JoinColumn(name = "entered_by")
    private Employee employee;

    @Column(precision = 12, scale = 2)
    private BigDecimal dueAmount = BigDecimal.valueOf(0);
}
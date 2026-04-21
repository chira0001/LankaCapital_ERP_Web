package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "dailyCollections")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DailyCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "file_number")
    private Loan fileNumber;

    private Integer installmentNumber;

    private Double paidAmount;

    @Column(columnDefinition = "DATE DEFAULT CURRENT_DATE", updatable = false, insertable = false)
    private LocalDate paidOn;

    @Column(columnDefinition = "TIME DEFAULT CURRENT_TIME", updatable = false, insertable = false)
    private LocalTime paidAt;

    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employeeId;

}

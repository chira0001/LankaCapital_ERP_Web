package com.lankacapital.server.entities;

import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.Request;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "petty_cash")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PettyCash {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP()")
    private LocalDateTime dateTime;

    private String narration;

    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private Employee requestEmployee;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Employee approvedEmployee;

    @Enumerated(EnumType.STRING)
    private Request request = Request.PENDING;

    @PrePersist
    public void update(){
        this.dateTime = LocalDateTime.now();
    }
}

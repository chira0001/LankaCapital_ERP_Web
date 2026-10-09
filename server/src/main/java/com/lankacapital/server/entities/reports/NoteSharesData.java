package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "noteSharesData")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NoteSharesData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDate financialDate;
    private Long numberOfShares;
}

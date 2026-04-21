package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employeeMetaData")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EmployeeMetaData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String category;

    @Column(nullable = false)
    private Double fieldOfficer;

    @Column(nullable = false)
    private Double receptionist;
}

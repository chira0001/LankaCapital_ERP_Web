package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salaryMetaData")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SalaryMetaData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "salary_condition_id")
    private SalaryCondition salaryCondition;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private Double value;

    private Long updateStatus = 0L;
}

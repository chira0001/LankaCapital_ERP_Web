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
public class SalaryMetaData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "salary_condition_id")
    private SalaryCondition salaryConditionId;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role roleId;

    private Double value;
}

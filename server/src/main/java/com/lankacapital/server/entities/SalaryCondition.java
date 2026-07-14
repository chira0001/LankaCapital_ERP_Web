package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salary_conditions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalaryCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String conditionName;

    private Long updateStatus = 0L;
}

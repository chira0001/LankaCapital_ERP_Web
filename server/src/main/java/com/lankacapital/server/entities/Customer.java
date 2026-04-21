package com.lankacapital.server.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lankacapital.server.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "customers")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Customer {

    @Id
    private long nic;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.customer;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    @JsonIgnore
    private String password = "pass@123";

    @OneToMany(mappedBy = "customer")
    private List<Loan> loans;

}

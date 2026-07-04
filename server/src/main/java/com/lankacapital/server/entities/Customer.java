package com.lankacapital.server.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Customer {

    @Id
    private Long nic;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String address;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(nullable = false)
    private String phoneNumber;

    private String bank;
    private String bankAccount;

    @OneToMany(mappedBy = "customer")
    @JsonIgnore
   private List<Loan> loans;
    //private List<Loan> loans = new ArrayList<>();

    @Column(nullable = false)
    private Boolean deleted = false;

    private Long updateStatus = 0L;

}

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
    private String nic;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
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

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Employee createdEmployee;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private Employee updatedEmployee;

//    private List<Loan> loans;

    private Long updateStatus = 0L;

}

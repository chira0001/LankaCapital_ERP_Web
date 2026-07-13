package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerRegisterDto {
    private String nic;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private String bank;
    private String bankAccount;
}

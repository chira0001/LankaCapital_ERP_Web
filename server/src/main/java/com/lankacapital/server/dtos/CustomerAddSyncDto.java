package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class CustomerAddSyncDto {
    private long nic;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;
}

package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class CustomerResAsyncDto {
    private String nic;
    private String name;
    private String email;
    private String address;
    private String phone_number;
    private Long update_status;
}

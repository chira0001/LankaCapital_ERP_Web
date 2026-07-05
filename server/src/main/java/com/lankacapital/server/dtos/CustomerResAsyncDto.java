package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class CustomerResAsyncDto {
    private long nic;
    private String name;
    private String email;
    private String address;
    private String phone_number;
    private Long update_status;
}

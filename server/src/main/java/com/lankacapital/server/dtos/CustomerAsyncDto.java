package com.lankacapital.server.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CustomerAsyncDto {
    private List<Long> nic;
}

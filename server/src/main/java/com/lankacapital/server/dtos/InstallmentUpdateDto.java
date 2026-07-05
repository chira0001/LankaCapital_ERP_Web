package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class InstallmentUpdateDto {
    private Integer id;
    private Integer value;
    private Long updateStatus;
}

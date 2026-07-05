package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanResSyncDto {
    private Integer id;
    private String uuid;
    private String status;
}

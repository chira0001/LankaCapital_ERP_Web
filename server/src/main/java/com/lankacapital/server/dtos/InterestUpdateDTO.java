package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class InterestUpdateDTO {
    private String fileNumber;
    private Double interestRate;
}

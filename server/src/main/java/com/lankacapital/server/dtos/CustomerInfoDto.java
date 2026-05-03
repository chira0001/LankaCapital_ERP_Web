package com.lankacapital.server.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CustomerInfoDto {
    private Long customerNIC;
    private String businessName;
    private String businessAddress;
    private String businessEmail;
    private String contactNumber;
    private List<LoanResponseDto> loans;
}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.InterestRateDto;
import com.lankacapital.server.entities.InterestRate;

public class InterestRateMapper {

    public static InterestRateDto mapToInterestRateDto(InterestRate interestRate){
        InterestRateDto dto = new InterestRateDto();
        dto.setId(interestRate.getId());
        dto.setRate(interestRate.getRate());
        return dto;
    }
}

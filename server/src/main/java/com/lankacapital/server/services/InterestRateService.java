package com.lankacapital.server.services;

import com.lankacapital.server.dtos.InterestRateDto;

import java.util.List;

public interface InterestRateService {

    List<InterestRateDto> getAllInterestRates();
    InterestRateDto addInterestRate(String rateVal);
    InterestRateDto UpdateInterestRateById(Integer id, String rateVal);
    String DeleteInterestRateById(Integer id);
}

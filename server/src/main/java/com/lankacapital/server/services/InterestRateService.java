package com.lankacapital.server.services;

import com.lankacapital.server.dtos.InterestRateAsyncDto;
import com.lankacapital.server.dtos.InterestRateDto;
import com.lankacapital.server.entities.InterestRate;

import java.util.List;

public interface InterestRateService {

    List<InterestRateDto> getAllInterestRates();
    InterestRateDto addInterestRate(String rateVal);
    InterestRateDto UpdateInterestRateById(Integer id, String rateVal);
    String DeleteInterestRateById(Integer id);
    List<InterestRate> findAllinterestRatesById(InterestRateAsyncDto interestRateList, int page);
}

package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.InterestRateDto;
import com.lankacapital.server.entities.InterestRate;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.InterestRateMapper;
import com.lankacapital.server.repositories.InterestRateRepository;
import com.lankacapital.server.services.InterestRateService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InterestRateServiceImpl implements InterestRateService {

    private InterestRateRepository interestRateRepository;

    @Override
    public List<InterestRateDto> getAllInterestRates() {
        List<InterestRate> rates = interestRateRepository.findAll();
        return rates.stream().map(InterestRateMapper::mapToInterestRateDto).toList();
    }

    @Override
    public InterestRateDto addInterestRate(String rateVal) {

        try {
            Double rate = Double.parseDouble(rateVal);

            InterestRate newRate = new InterestRate();
            newRate.setRate(rate);
            return InterestRateMapper.mapToInterestRateDto(interestRateRepository.save(newRate));

        } catch (NumberFormatException e) {
            throw new RuntimeException("Enter valid interest rate");
        }
    }

    @Override
    public InterestRateDto UpdateInterestRateById(Integer id, String rateVal) {
        try{
            Double rate = Double.parseDouble(rateVal);
            InterestRate existRate = interestRateRepository.findById(id)
                    .orElseThrow(()-> new ResourceNotFoundException("Interest rate not available"));

            existRate.setRate(rate);
            return InterestRateMapper.mapToInterestRateDto(interestRateRepository.save(existRate));
        } catch (NumberFormatException e){
            throw new RuntimeException("Enter valid interest rate");
        }

    }

    @Override
    public String DeleteInterestRateById(Integer id) {
        if(!interestRateRepository.existsById(id)){
            throw new ResourceNotFoundException("Interest rate not available");
        }
        interestRateRepository.deleteById(id);
        return "Interest rate deleted successfully";
    }
}

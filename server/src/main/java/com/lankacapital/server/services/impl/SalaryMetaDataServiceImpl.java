package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.SalaryMetaData;
import com.lankacapital.server.repositories.SalaryMetaDataRepository;
import com.lankacapital.server.services.SalaryMetaDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SalaryMetaDataServiceImpl implements SalaryMetaDataService {
    private final SalaryMetaDataRepository salaryMetaDataRepository;


    @Override
    public List<SalaryMetaData> getAllSalaryMetaData() {
        return salaryMetaDataRepository.findAll();
    }

    @Override
    public List<SalaryMetaData> updateAllSalaryMetaData(List<SalaryMetaData> metaDataList) {
        return salaryMetaDataRepository.saveAll(metaDataList);
    }
}

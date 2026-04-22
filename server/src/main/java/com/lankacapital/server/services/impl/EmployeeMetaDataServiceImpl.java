package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.SalaryMetaData;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.repositories.SalaryMetaDataRepository;
import com.lankacapital.server.services.EmployeeMetaDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeMetaDataServiceImpl implements EmployeeMetaDataService {
    private SalaryMetaDataRepository salaryMetaDataRepository;

    @Override
    public List<SalaryMetaData> getAllData() {
        return salaryMetaDataRepository.findAll();
    }

    @Override
    public SalaryMetaData getDataById(String id) {
        try {
            int categoryId = Integer.parseInt(id);
            return salaryMetaDataRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id : " + id));
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid id type");
        }
    }
}

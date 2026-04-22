package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.EmployeeMetaData;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.repositories.EmployeeMetaDataRepository;
import com.lankacapital.server.services.EmployeeMetaDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeMetaDataServiceImpl implements EmployeeMetaDataService {
    private EmployeeMetaDataRepository employeeMetaDataRepository;

    @Override
    public List<EmployeeMetaData> getAllData() {
        return employeeMetaDataRepository.findAll();
    }

    @Override
    public EmployeeMetaData getDataById(String id) {
        try {
            int categoryId = Integer.parseInt(id);
            return employeeMetaDataRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id : " + id));
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid id type");
        }
    }
}

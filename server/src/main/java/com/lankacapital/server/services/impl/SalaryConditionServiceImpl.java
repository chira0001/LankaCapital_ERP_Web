package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.ConditionRegisterDto;
import com.lankacapital.server.entities.SalaryCondition;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.repositories.SalaryConditionRepository;
import com.lankacapital.server.services.SalaryConditionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SalaryConditionServiceImpl implements SalaryConditionService {

    private SalaryConditionRepository salaryConditionRepository;

    @Override
    public SalaryCondition addNewSalaryCondition(ConditionRegisterDto dto) {
        if (salaryConditionRepository.existsByConditionName(dto.getConditionName())){
            throw new ResourceExistException("Condition already exists with name : " + dto.getConditionName());
        }
        SalaryCondition newSalaryCondition = new SalaryCondition();
        newSalaryCondition.setConditionName(dto.getConditionName());
        return salaryConditionRepository.save(newSalaryCondition);
    }

    @Override
    public List<SalaryCondition> getAllSalaryConditions() {
        return salaryConditionRepository.findAll();
    }

    @Override
    public SalaryCondition getSalaryConditionByConditionName(ConditionRegisterDto dto) {
        SalaryCondition salaryCondition = salaryConditionRepository.findByConditionName(dto.getConditionName());
        if(salaryCondition == null){
            throw new ResourceNotFoundException("Salary condition not exists : " + dto.getConditionName());
        }
        return salaryCondition;
    }
}

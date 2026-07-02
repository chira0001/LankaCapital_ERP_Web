package com.lankacapital.server.services;

import com.lankacapital.server.dtos.ConditionRegisterDto;
import com.lankacapital.server.entities.SalaryCondition;

import java.util.List;

public interface SalaryConditionService {
    SalaryCondition addNewSalaryCondition(ConditionRegisterDto dto);
    List<SalaryCondition> getAllSalaryConditions();
    SalaryCondition getSalaryConditionByConditionName(ConditionRegisterDto dto);
}

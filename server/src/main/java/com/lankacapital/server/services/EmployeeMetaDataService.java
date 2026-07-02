package com.lankacapital.server.services;

import com.lankacapital.server.entities.SalaryMetaData;

import java.util.List;

public interface EmployeeMetaDataService {

    List<SalaryMetaData> getAllData();
    SalaryMetaData getDataById(String id);


}

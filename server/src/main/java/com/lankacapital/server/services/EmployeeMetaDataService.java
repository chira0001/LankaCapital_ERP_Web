package com.lankacapital.server.services;

import com.lankacapital.server.entities.EmployeeMetaData;

import java.util.List;

public interface EmployeeMetaDataService {

    List<EmployeeMetaData> getAllData();
    EmployeeMetaData getDataById(String id);


}

package com.lankacapital.server.services;

import com.lankacapital.server.entities.SalaryMetaData;

import java.util.List;

public interface SalaryMetaDataService {

    List<SalaryMetaData> getAllSalaryMetaData();
    List<SalaryMetaData> updateAllSalaryMetaData(List<SalaryMetaData> metaDataList);

}

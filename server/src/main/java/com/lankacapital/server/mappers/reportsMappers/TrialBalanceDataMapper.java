package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import com.lankacapital.server.entities.reports.TrialBalanceData;

public class TrialBalanceDataMapper {

    public static TrialBalanceData mapToTrialBalanceData (TrialBalanceDataDto dto){
        TrialBalanceData trial = new TrialBalanceData();

        trial.setAccountName(dto.getAccountName());
        trial.setAmount(dto.getAmount());
        trial.setTransactionType(dto.getTransactionType());
        trial.setAccountType(dto.getAccountType());
        trial.setFinancialDate(dto.getFinancialDate());

        return trial;
    }

    public static TrialBalanceDataDto mapToTrialBalanceDataDto (TrialBalanceData data){
        TrialBalanceDataDto dataDto = new TrialBalanceDataDto();

        dataDto.setAccountName(data.getAccountName());
        dataDto.setAmount(data.getAmount());
        dataDto.setTransactionType(data.getTransactionType());
        dataDto.setAccountType(data.getAccountType());
        dataDto.setFinancialDate(data.getFinancialDate());

        return dataDto;
    }
}

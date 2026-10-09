package com.lankacapital.server.mappers.statementMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAssetsDto;
import com.lankacapital.server.dtos.StatementDto.PPE;
import com.lankacapital.server.entities.reports.EquityChange;
import com.lankacapital.server.entities.reports.TrialBalanceData;
import com.lankacapital.server.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;

public class PPE_WORKING_Mapper {
    public static WorkingAssetsDto mapToWorkingAssetsDto(PPE ppe){
        WorkingAssetsDto assetsDto = new WorkingAssetsDto();

        assetsDto.setAssetName(ppe.getAsset());
        assetsDto.setAssetAmount(ppe.getAmount());

        return assetsDto;
    }

    public static TrialBalanceDataDto mapToTrialBalanceDataDtoFromPPE(PPE ppe){
        TrialBalanceDataDto dataDto = new TrialBalanceDataDto();

        dataDto.setAccountName(ppe.getAsset());
        dataDto.setAmount(ppe.getAmount());
        dataDto.setTransactionType("DR");
        dataDto.setAccountType(AccountType.Assets);
        dataDto.setFinancialDate(LocalDate.now());

        return dataDto;
    }

    public static TrialBalanceDataDto mapToTrialBalanceDataDtoFromWorkingAdministrativeExpenseDto(WorkingAdministrativeExpenseDto dto){
        TrialBalanceDataDto dataDto = new TrialBalanceDataDto();

        dataDto.setAccountName(dto.getAdminExpenseName());
        dataDto.setAmount(dto.getAdminExpenseAmount());
        dataDto.setTransactionType("DR");
        dataDto.setAccountType(AccountType.Expenses);
        dataDto.setFinancialDate(LocalDate.now());

        return dataDto;
    }

    public static TrialBalanceDataDto mapToDto(TrialBalanceData e) {
        TrialBalanceDataDto dto = new TrialBalanceDataDto();
        dto.setAccountName(e.getAccountName());
        dto.setAmount(e.getAmount());
        dto.setTransactionType(e.getTransactionType());
        dto.setAccountType(e.getAccountType());
        dto.setFinancialDate(e.getFinancialDate());
        return dto;
    }

    public static HashMap<String, BigDecimal> mapToCEHashMapFromEquityChange(EquityChange change){
        HashMap<String, BigDecimal> map = new HashMap<>();

        if(change.getDataName().trim().toLowerCase().startsWith("balance")){
            map.put(change.getDataName(),change.getRetainedEarningAmount());
            map.put(change.getDataName(),change.getStatedCapitalAmount());
        }
        else if(change.getDataName().equalsIgnoreCase("Shares Issued")){
            map.put(change.getDataName(),change.getRetainedEarningAmount());
        }
        else if(change.getDataName().equalsIgnoreCase("Profit or Loss for the Period")){
            map.put(change.getDataName(),change.getStatedCapitalAmount());
        }

        return map;
    }
}

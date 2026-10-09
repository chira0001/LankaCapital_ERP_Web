package com.lankacapital.server.dtos.StatementDto;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import lombok.Data;

import java.util.List;

@Data
public class TRIALBALANCE {
    private List<TrialBalanceDataDto> BankAccounts;
    private List<TrialBalanceDataDto> Assets;
    private List<TrialBalanceDataDto> Liabilities;
    private List<TrialBalanceDataDto> Equity;
    private List<TrialBalanceDataDto> Expenses;
    private List<TrialBalanceDataDto> Income;
}

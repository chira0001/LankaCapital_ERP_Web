package com.lankacapital.server.dtos;

import java.math.BigDecimal;

public class MonthlyIncomeRequestDto {

    private BigDecimal totalIncome;
    private BigDecimal loanInterest;
    private BigDecimal registrationFees;
    private BigDecimal otherIncome;
    private String month;

    public MonthlyIncomeRequestDto() {}

    public MonthlyIncomeRequestDto(BigDecimal totalIncome,
                                   BigDecimal loanInterest,
                                   BigDecimal registrationFees,
                                   BigDecimal otherIncome,
                                   String month) {
        this.totalIncome = totalIncome;
        this.loanInterest = loanInterest;
        this.registrationFees = registrationFees;
        this.otherIncome = otherIncome;
        this.month = month;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getLoanInterest() {
        return loanInterest;
    }

    public void setLoanInterest(BigDecimal loanInterest) {
        this.loanInterest = loanInterest;
    }

    public BigDecimal getRegistrationFees() {
        return registrationFees;
    }

    public void setRegistrationFees(BigDecimal registrationFees) {
        this.registrationFees = registrationFees;
    }

    public BigDecimal getOtherIncome() {
        return otherIncome;
    }

    public void setOtherIncome(BigDecimal otherIncome) {
        this.otherIncome = otherIncome;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }
}
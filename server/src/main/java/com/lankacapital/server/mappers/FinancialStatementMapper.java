package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.FinancialRequestDto;
import com.lankacapital.server.dtos.FinancialStatementDto;
import com.lankacapital.server.entities.FinancialStatement;

public class FinancialStatementMapper {

    public static FinancialStatementDto toDto(FinancialStatement entity) {

        return FinancialStatementDto.builder()
                .id(entity.getId())
                .reportDate(entity.getReportDate())

                .receivables(entity.getReceivables())
                .cashAndCashEquivalent(entity.getCashAndCashEquivalent())
                .inventory(entity.getInventory())
                .prepaidExpenses(entity.getPrepaidExpenses())
                .landBuilding(entity.getLandBuilding())
                .vehicles(entity.getVehicles())
                .furniture(entity.getFurniture())
                .equipment(entity.getEquipment())
                .accumulatedDepreciation(entity.getAccumulatedDepreciation())

                .tradePayables(entity.getTradePayables())
                .directorCurrentAccount(entity.getDirectorCurrentAccount())
                .bankLoan(entity.getBankLoan())
                .otherLiabilities(entity.getOtherLiabilities())

                .capital(entity.getCapital())
                .retainedEarnings(entity.getRetainedEarnings())

                .notes(entity.getNotes())

                .build();
    }

    public static FinancialStatement toEntity(FinancialStatementDto dto) {

        return FinancialStatement.builder()
                .id(dto.getId())
                .reportDate(dto.getReportDate())

                .receivables(dto.getReceivables())
                .cashAndCashEquivalent(dto.getCashAndCashEquivalent())
                .inventory(dto.getInventory())
                .prepaidExpenses(dto.getPrepaidExpenses())
                .landBuilding(dto.getLandBuilding())
                .vehicles(dto.getVehicles())
                .furniture(dto.getFurniture())
                .equipment(dto.getEquipment())
                .accumulatedDepreciation(dto.getAccumulatedDepreciation())

                .tradePayables(dto.getTradePayables())
                .directorCurrentAccount(dto.getDirectorCurrentAccount())
                .bankLoan(dto.getBankLoan())
                .otherLiabilities(dto.getOtherLiabilities())

                .capital(dto.getCapital())
                .retainedEarnings(dto.getRetainedEarnings())

                .notes(dto.getNotes())

                .build();
    }

    public static FinancialStatement mapToFinancialStatement(FinancialRequestDto dto){
        FinancialStatement financialStatement = new FinancialStatement();

        financialStatement.setLandBuilding(dto.getLandBuilding());
        financialStatement.setEquipment(dto.getEquipment());
        financialStatement.setFurniture(dto.getFurniture());
        financialStatement.setVehicles(dto.getVehicles());
        financialStatement.setAccumulatedDepreciation(dto.getAccumulatedDepreciation());
        financialStatement.setDirectorCurrentAccount(dto.getDirectorCurrentAccount());
        financialStatement.setOtherLiabilities(dto.getOtherLiabilities());
        financialStatement.setTradePayables(dto.getTradePayables());
        financialStatement.setInventory(dto.getInventory());
        financialStatement.setPrepaidExpenses(dto.getPrepaidExpenses());
        financialStatement.setBankLoan(dto.getBankLoan());
        financialStatement.setNotes(dto.getNotes());

        return financialStatement;
    }

}
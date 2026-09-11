package com.lankacapital.server.mappers.statementMappers;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAssetsDto;
import com.lankacapital.server.dtos.StatementDto.PPE;

public class PPE_WORKING_Mapper {
    public static WorkingAssetsDto mapToWorkingAssetsDto(PPE ppe){
        WorkingAssetsDto assetsDto = new WorkingAssetsDto();

        assetsDto.setAssetName(ppe.getAsset());
        assetsDto.setAssetAmount(ppe.getAmount());

        return assetsDto;
    }
}

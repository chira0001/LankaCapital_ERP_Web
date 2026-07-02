package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.PettyCashDto;
import com.lankacapital.server.dtos.PettyCashResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;

public class PettyCashMapper {

    public static PettyCash mapToPettyCash(PettyCashDto pettyCashDto){
        PettyCash pettyCash = new PettyCash();

        pettyCash.setNarration(pettyCashDto.getNarration());
        pettyCash.setAmount(pettyCashDto.getAmount());

        return pettyCash;
    }

    public static PettyCashResponseDto mapToPettyCashResponseDto(PettyCash pettyCash){
        PettyCashResponseDto dto = new PettyCashResponseDto();
        dto.setId(pettyCash.getId());
        dto.setDateTime(pettyCash.getDateTime());
        dto.setNarration(pettyCash.getNarration());
        dto.setAmount(pettyCash.getAmount());
        dto.setRequest(pettyCash.getRequest());
        if(pettyCash.getRequestEmployee() != null){
            dto.setRequestEmployee(EmployeeMapper.mapToEmployeeResponseDto(pettyCash.getRequestEmployee()));
        }else {
            dto.setRequestEmployee(EmployeeMapper.mapToEmployeeResponseDto(new Employee()));
        }

        if(pettyCash.getApprovedEmployee() != null){
            dto.setApprovedEmployee(EmployeeMapper.mapToEmployeeResponseDto(pettyCash.getApprovedEmployee()));
        }else {
            dto.setApprovedEmployee(EmployeeMapper.mapToEmployeeResponseDto(new Employee()));
        }

        return dto;
    }
}

package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NoteSharesDataDto {
    private LocalDate financialDate;
    private Long numberOfShares;
}

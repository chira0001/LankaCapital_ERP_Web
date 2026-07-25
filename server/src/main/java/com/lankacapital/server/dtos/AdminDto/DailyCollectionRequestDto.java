package com.lankacapital.server.dtos.AdminDto;

import lombok.Data;

@Data
public class DailyCollectionRequestDto {
    private String startDate;
    private String endDate;
}

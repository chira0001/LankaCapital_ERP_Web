package com.lankacapital.server.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CollectionReqDto {
    private String fileNumber;
    private LocalDateTime paidAt;
}

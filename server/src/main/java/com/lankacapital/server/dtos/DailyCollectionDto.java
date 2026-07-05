//package com.lankacapital.server.dtos;
//
//import lombok.Data;
//
//import java.math.BigDecimal;
//@Data
//public class DailyCollectionDto {
//
//    private String date;
//    private BigDecimal totalCollected;
//    private String officerName;
//    private String customerName;
//    private BigDecimal amount;
//    private Integer totalTransactions;
//
//}

package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DailyCollectionDto {

    private String fileNumber;

    private String customerName;

    private String officerName;

    private Integer installmentNumber;

    private BigDecimal paidAmount;

    private BigDecimal dueAmount;

    private LocalDateTime paidAt;
}
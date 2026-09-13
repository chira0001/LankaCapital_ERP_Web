package com.lankacapital.server.dtos.StatementDto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.HashMap;

@Data
public class CE {
    private HashMap<String, BigDecimal> statedCapitalBalance = new HashMap<>();
    private HashMap<String, BigDecimal> retainedEarningBalance = new HashMap<>();
    private HashMap<String, BigDecimal> retainedEarningShares = new HashMap<>();
    private HashMap<String, BigDecimal> statedCapitalPL = new HashMap<>();
}
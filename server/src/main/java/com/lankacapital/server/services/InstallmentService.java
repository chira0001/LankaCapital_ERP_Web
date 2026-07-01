package com.lankacapital.server.services;

import com.lankacapital.server.dtos.InstallmentsAsyncDto;
import com.lankacapital.server.entities.Installment;

import java.util.List;

public interface InstallmentService {
    List<Installment> getAllInstallments();
    List<Installment> findAllInstallmentsById(InstallmentsAsyncDto installmentIdList, int page);
}

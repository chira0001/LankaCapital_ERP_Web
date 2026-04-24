package com.lankacapital.server.services;

import com.lankacapital.server.entities.Installment;

import java.util.List;

public interface InstallmentService {
    List<Installment> getAllInstallments();
}

package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.repositories.InstallmentRepository;
import com.lankacapital.server.services.InstallmentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;

    @Override
    public List<Installment> getAllInstallments() {
        return installmentRepository.findAll();
    }
}

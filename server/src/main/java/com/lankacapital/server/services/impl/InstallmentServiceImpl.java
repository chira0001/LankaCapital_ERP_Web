package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.InstallmentUpdateDto;
import com.lankacapital.server.dtos.InstallmentsAsyncDto;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.repositories.InstallmentRepository;
import com.lankacapital.server.services.InstallmentService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class InstallmentServiceImpl implements InstallmentService {

    private final InstallmentRepository installmentRepository;

    @Override
    public List<Installment> getAllInstallments() {
        return installmentRepository.findAll();
    }

    @Override
    public List<Installment> findAllInstallmentsById(InstallmentsAsyncDto installmentIdList, int page){
        List<Integer> allInstallmentIds = installmentRepository.findAllInstallmentIds();
        if(allInstallmentIds == null){
            throw new ResourceNotFoundException("Installments not found with ID");
        }
        List<Integer> notSyncedIds = new ArrayList<>();
        for (Integer id : allInstallmentIds) {
            if (!installmentIdList.getId().contains(id)) {
                notSyncedIds.add(id);
            }
        }
        if(notSyncedIds.isEmpty()){
            return List.of();
        }
        Pageable pageable = PageRequest.of(page, 10);
        return installmentRepository.findInstallmentsByIdIn(notSyncedIds, pageable);
    }

//    @Override
//    public List<InstallmentUpdateDto> updateInstallments(int page){
//
//    }
}

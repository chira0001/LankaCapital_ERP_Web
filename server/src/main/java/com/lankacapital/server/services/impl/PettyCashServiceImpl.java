package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.PettyCashDto;
import com.lankacapital.server.dtos.PettyCashResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;
import com.lankacapital.server.enums.Request;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.PettyCashMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.PettyCashRepository;
import com.lankacapital.server.services.PettyCashService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PettyCashServiceImpl implements PettyCashService {
    private PettyCashRepository pettyCashRepository;
    private EmployeeRepository employeeRepository;

    @Override
    public PettyCashResponseDto addPettyCash(PettyCashDto pettyCashDto, String username) {
        try {
            PettyCash pettyCash = PettyCashMapper.mapToPettyCash(pettyCashDto);
            Employee requestEmployee = employeeRepository.findByEmail(username);
            if(requestEmployee == null){
                throw new ResourceNotFoundException("Employee verification not found");
            }
            pettyCash.setRequestEmployee(requestEmployee);
            pettyCashRepository.save(pettyCash);

            return PettyCashMapper.mapToPettyCashResponseDto(pettyCash);

        } catch (RuntimeException e) {
            throw new RuntimeException("Petty cash submission failed");
        }
    }

    @Override
    public List<PettyCashResponseDto> getPettyCashForEmployee(String username) {

        Employee requestEmployee = employeeRepository.findByEmail(username);
        if(requestEmployee == null){
            throw new ResourceNotFoundException("Employee verification not found");
        }
        List<PettyCash> pettyCashList = pettyCashRepository.findByRequestEmployee(requestEmployee);
        return pettyCashList.stream().map(PettyCashMapper::mapToPettyCashResponseDto).toList();
    }


    //get pending
    @Override
    public List<PettyCashResponseDto> getPendingRequests() {
        return pettyCashRepository.findByRequest(Request.PENDING)
                .stream()
                .map(PettyCashMapper::mapToPettyCashResponseDto)
                .toList();
    }

    //approve
    @Override
    public PettyCashResponseDto approvePettyCash(Long id, String adminUsername) {

        PettyCash pettyCash = pettyCashRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Petty cash not found"));

        Employee admin = employeeRepository.findByEmail(adminUsername);

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found");
        }

        pettyCash.setRequest(Request.APPROVED);
        pettyCash.setApprovedEmployee(admin);

        pettyCashRepository.save(pettyCash);

        return PettyCashMapper.mapToPettyCashResponseDto(pettyCash);
    }

    //reject
    @Override
    public PettyCashResponseDto rejectPettyCash(Long id, String adminUsername) {

        PettyCash pettyCash = pettyCashRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Petty cash not found"));

        Employee admin = employeeRepository.findByEmail(adminUsername);

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found");
        }

        pettyCash.setRequest(Request.REJECTED);
        pettyCash.setApprovedEmployee(admin);

        pettyCashRepository.save(pettyCash);

        return PettyCashMapper.mapToPettyCashResponseDto(pettyCash);
    }

    @Override
    public List<PettyCashResponseDto> getAllPettyCash() {

        return pettyCashRepository.findAll()
                .stream()
                .map(PettyCashMapper::mapToPettyCashResponseDto)
                .toList();
    }


}

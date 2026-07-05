package com.lankacapital.server.services;

import com.lankacapital.server.dtos.EmployeeProfileDto;

public interface EmployeeProfileService {



        EmployeeProfileDto getMyProfile(String email);

        EmployeeProfileDto updateMyProfile(String email, EmployeeProfileDto dto);

}
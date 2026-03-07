package com.qacts.springbootapps.service;

import com.qacts.springbootapps.dto.EmployeeRequest;
import com.qacts.springbootapps.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    List<EmployeeResponse> getAllEmployees();

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);

    List<EmployeeResponse> getEmployeesByDepartment(String department);

    List<EmployeeResponse> searchEmployees(String keyword);
}

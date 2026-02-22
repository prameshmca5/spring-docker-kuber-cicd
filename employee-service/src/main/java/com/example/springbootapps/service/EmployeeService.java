package com.example.springbootapps.service;

import com.example.springbootapps.dto.EmployeeRequest;
import com.example.springbootapps.dto.EmployeeResponse;

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

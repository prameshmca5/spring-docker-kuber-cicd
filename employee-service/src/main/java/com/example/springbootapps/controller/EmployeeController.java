package com.example.springbootapps.controller;

import com.example.springbootapps.dto.ApiResponse;
import com.example.springbootapps.dto.EmployeeRequest;
import com.example.springbootapps.dto.EmployeeResponse;
import com.example.springbootapps.service.EmployeeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * POST /api/v1/employees
     * Create a new employee
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        log.info("REST request to create employee");
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", response));
    }

    /**
     * GET /api/v1/employees/{id}
     * Get a single employee by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        log.info("REST request to get employee with ID: {}", id);
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success("Employee fetched successfully", response));
    }

    /**
     * GET /api/v1/employees
     * Get all employees (with optional search & department filter)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department) {

        List<EmployeeResponse> employees;

        if (keyword != null && !keyword.isBlank()) {
            log.info("REST request to search employees with keyword: {}", keyword);
            employees = employeeService.searchEmployees(keyword);
        } else if (department != null && !department.isBlank()) {
            log.info("REST request to get employees by department: {}", department);
            employees = employeeService.getEmployeesByDepartment(department);
        } else {
            log.info("REST request to get all employees");
            employees = employeeService.getAllEmployees();
        }

        return ResponseEntity.ok(ApiResponse.success("Employees fetched successfully", employees));
    }

    /**
     * PUT /api/v1/employees/{id}
     * Update an existing employee
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        log.info("REST request to update employee with ID: {}", id);
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
    }

    /**
     * DELETE /api/v1/employees/{id}
     * Delete an employee
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        log.info("REST request to delete employee with ID: {}", id);
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
}

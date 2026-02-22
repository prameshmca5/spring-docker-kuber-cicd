package com.example.springbootapps.service.impl;

import com.example.springbootapps.dto.EmployeeRequest;
import com.example.springbootapps.dto.EmployeeResponse;
import com.example.springbootapps.entity.Employee;
import com.example.springbootapps.exception.DuplicateResourceException;
import com.example.springbootapps.exception.ResourceNotFoundException;
import com.example.springbootapps.repository.EmployeeRepository;
import com.example.springbootapps.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        log.info("Creating employee with email: {}", request.email());

        if (employeeRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Employee", "email", request.email());
        }

        var employee = mapToEntity(request);
        var saved = employeeRepository.save(employee);
        log.info("Employee created with ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        log.info("Fetching employee with ID: {}", id);
        return mapToResponse(findEmployeeById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        log.info("Fetching all employees");
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList(); // Java 16+ Stream.toList() — unmodifiable
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        log.info("Updating employee with ID: {}", id);
        var employee = findEmployeeById(id);

        // Check email uniqueness only if it has changed
        if (!employee.getEmail().equalsIgnoreCase(request.email())
                && employeeRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Employee", "email", request.email());
        }

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setDepartment(request.department());
        employee.setSalary(request.salary());
        employee.setPhone(request.phone());

        var updated = employeeRepository.save(employee);
        log.info("Employee updated with ID: {}", updated.getId());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with ID: {}", id);
        var employee = findEmployeeById(id);
        employeeRepository.delete(employee);
        log.info("Employee deleted with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByDepartment(String department) {
        log.info("Fetching employees for department: {}", department);
        return employeeRepository.findByDepartment(department)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchEmployees(String keyword) {
        log.info("Searching employees with keyword: {}", keyword);
        return employeeRepository.searchByKeyword(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    /** Maps a validated EmployeeRequest record to a new Employee entity. */
    private Employee mapToEntity(EmployeeRequest request) {
        return Employee.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .department(request.department())
                .salary(request.salary())
                .phone(request.phone())
                .build();
    }

    /**
     * Maps a persisted Employee entity to an immutable EmployeeResponse record
     * using the canonical constructor.
     */
    private EmployeeResponse mapToResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getSalary(),
                employee.getPhone(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }
}

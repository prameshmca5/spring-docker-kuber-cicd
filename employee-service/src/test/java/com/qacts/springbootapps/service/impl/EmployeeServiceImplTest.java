package com.qacts.springbootapps.service.impl;

import com.qacts.springbootapps.dto.EmployeeRequest;
import com.qacts.springbootapps.dto.EmployeeResponse;
import com.qacts.springbootapps.entity.Employee;
import com.qacts.springbootapps.exception.DuplicateResourceException;
import com.qacts.springbootapps.exception.ResourceNotFoundException;
import com.qacts.springbootapps.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private EmployeeRequest request;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@qacts.com")
                .department("Engineering")
                .salary(85000.0)
                .phone("+15550198")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        request = new EmployeeRequest(
                "John", "Doe", "john.doe@qacts.com", "Engineering", 85000.0, "+15550198");
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.existsByEmail(anyString())).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo(request.email());
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail_ThrowsException() {
        when(employeeRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(1L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
    }

    @Test
    void getEmployeeById_NotFound_ThrowsException() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAllEmployees_Success() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        List<EmployeeResponse> responses = employeeService.getAllEmployees();

        assertThat(responses).hasSize(1);
    }

    @Test
    void updateEmployee_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeResponse response = employeeService.updateEmployee(1L, request);

        assertThat(response).isNotNull();
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void deleteEmployee_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        doNothing().when(employeeRepository).delete(employee);

        employeeService.deleteEmployee(1L);

        verify(employeeRepository).delete(employee);
    }

    @Test
    void getEmployeesByDepartment_Success() {
        when(employeeRepository.findByDepartment("Engineering")).thenReturn(List.of(employee));

        List<EmployeeResponse> responses = employeeService.getEmployeesByDepartment("Engineering");

        assertThat(responses).hasSize(1);
    }

    @Test
    void searchEmployees_Success() {
        when(employeeRepository.searchByKeyword("John")).thenReturn(List.of(employee));

        List<EmployeeResponse> responses = employeeService.searchEmployees("John");

        assertThat(responses).hasSize(1);
    }
}

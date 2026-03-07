package com.qacts.springbootapps.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qacts.springbootapps.dto.ApiResponse;
import com.qacts.springbootapps.dto.EmployeeRequest;
import com.qacts.springbootapps.dto.EmployeeResponse;
import com.qacts.springbootapps.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    @Autowired
    private ObjectMapper objectMapper;

    private EmployeeResponse employeeResponse;
    private EmployeeRequest employeeRequest;

    @BeforeEach
    void setUp() {
        employeeResponse = new EmployeeResponse(
                1L, "John", "Doe", "john.doe@qacts.com", "Engineering", 85000.0, "+15550198",
                LocalDateTime.now(), LocalDateTime.now());

        employeeRequest = new EmployeeRequest(
                "John", "Doe", "john.doe@qacts.com", "Engineering", 85000.0, "+15550198");
    }

    @Test
    void createEmployee_ReturnsCreated() throws Exception {
        when(employeeService.createEmployee(any(EmployeeRequest.class))).thenReturn(employeeResponse);

        mockMvc.perform(post("/api/v1/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("john.doe@qacts.com"));
    }

    @Test
    void getEmployeeById_ReturnsOk() throws Exception {
        when(employeeService.getEmployeeById(1L)).thenReturn(employeeResponse);

        mockMvc.perform(get("/api/v1/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getAllEmployees_ReturnsList() throws Exception {
        when(employeeService.getAllEmployees()).thenReturn(List.of(employeeResponse));

        mockMvc.perform(get("/api/v1/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].firstName").value("John"));
    }

    @Test
    void searchEmployees_ReturnsList() throws Exception {
        when(employeeService.searchEmployees("John")).thenReturn(List.of(employeeResponse));

        mockMvc.perform(get("/api/v1/employees").param("keyword", "John"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].firstName").value("John"));
    }

    @Test
    void getEmployeesByDepartment_ReturnsList() throws Exception {
        when(employeeService.getEmployeesByDepartment("Engineering")).thenReturn(List.of(employeeResponse));

        mockMvc.perform(get("/api/v1/employees").param("department", "Engineering"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].department").value("Engineering"));
    }

    @Test
    void updateEmployee_ReturnsOk() throws Exception {
        when(employeeService.updateEmployee(eq(1L), any(EmployeeRequest.class))).thenReturn(employeeResponse);

        mockMvc.perform(put("/api/v1/employees/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deleteEmployee_ReturnsOk() throws Exception {
        mockMvc.perform(delete("/api/v1/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

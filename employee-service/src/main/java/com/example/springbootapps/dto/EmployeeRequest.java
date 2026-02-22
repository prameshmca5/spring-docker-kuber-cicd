package com.example.springbootapps.dto;

import jakarta.validation.constraints.*;

/**
 * Java 17 Record — immutable DTO for incoming Employee create/update requests.
 * Records auto-generate: canonical constructor, accessors (firstName(),
 * email(), ...),
 * equals(), hashCode(), and toString(). No Lombok needed.
 */
public record EmployeeRequest(

        @NotBlank(message = "First name is required") @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters") String firstName,

        @NotBlank(message = "Last name is required") @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters") String lastName,

        @NotBlank(message = "Email is required") @Email(message = "Email must be a valid email address") String email,

        @Size(max = 100, message = "Department name must not exceed 100 characters") String department,

        @DecimalMin(value = "0.0", inclusive = false, message = "Salary must be greater than 0") Double salary,

        @Pattern(regexp = "^[+]?[0-9\\-\\s]{7,20}$", message = "Phone number is invalid") String phone

) {
}

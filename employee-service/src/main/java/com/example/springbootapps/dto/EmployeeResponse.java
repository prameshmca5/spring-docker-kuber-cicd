package com.example.springbootapps.dto;

import java.time.LocalDateTime;

/**
 * Java 17 Record — immutable DTO for outgoing Employee API responses.
 * Accessors are: id(), firstName(), lastName(), email(), department(),
 * salary(), phone(), createdAt(), updatedAt()
 */
public record EmployeeResponse(

        Long id,
        String firstName,
        String lastName,
        String email,
        String department,
        Double salary,
        String phone,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}

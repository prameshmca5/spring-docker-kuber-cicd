package com.qacts.springbootapps.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Java 17 Generic Record — uniform API response wrapper.
 *
 * <p>
 * Records support generics and static factory methods out of the box.
 * The {@code @JsonInclude} annotation suppresses null fields in JSON output.
 *
 * <p>
 * Usage:
 * 
 * <pre>
 *   ApiResponse.success("Created", employeeResponse)
 *   ApiResponse.error("Not found", List.of("Employee with id 5 does not exist"))
 * </pre>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(

        boolean success,
        String message,
        T data,
        List<String> errors,
        LocalDateTime timestamp

) {
    // ─── Static Factory Methods ──────────────────────────────────────────────

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return new ApiResponse<>(false, message, null, errors, LocalDateTime.now());
    }
}

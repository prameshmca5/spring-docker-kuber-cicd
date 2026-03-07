package com.qacts.authservice.dto;

public record AuthResponse(
        String token,
        String type,
        Long id,
        String username,
        String email,
        String role) {
}

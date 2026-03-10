package com.qacts.authservice.controller;

import com.qacts.authservice.dto.AuthRequest;
import com.qacts.authservice.dto.AuthResponse;
import com.qacts.authservice.dto.RegisterRequest;
import com.qacts.authservice.entity.User;
import com.qacts.authservice.repository.UserRepository;
import com.qacts.authservice.util.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder encoder,
            JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        String jwt = jwtUtils.generateJwtToken(user.getUsername(), user.getRole(), user.getId());

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.username())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        String role = normalizeRole(signUpRequest.role());

        User user = new User(signUpRequest.username(),
                signUpRequest.email(),
                encoder.encode(signUpRequest.password()),
                role);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return DEFAULT_ROLE;
        }

        String normalized = role.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }
}

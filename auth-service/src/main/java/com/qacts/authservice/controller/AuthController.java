package com.qacts.authservice.controller;

import com.qacts.authservice.dto.AuthRequest;
import com.qacts.authservice.dto.AuthResponse;
import com.qacts.authservice.dto.RegisterRequest;
import com.qacts.authservice.entity.User;
import com.qacts.authservice.repository.UserRepository;
import com.qacts.authservice.util.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) authentication
                .getPrincipal();

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
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
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.username())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        String role = (signUpRequest.role() != null && !signUpRequest.role().isEmpty())
                ? signUpRequest.role()
                : "ROLE_USER";

        User user = new User(signUpRequest.username(),
                signUpRequest.email(),
                encoder.encode(signUpRequest.password()),
                role);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}

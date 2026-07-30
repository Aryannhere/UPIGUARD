package com.upiguard.backend.controller;

import com.upiguard.backend.dto.AuthResponse;
import com.upiguard.backend.dto.LoginRequest;
import com.upiguard.backend.dto.RegisterRequest;
import com.upiguard.backend.entity.User;
import com.upiguard.backend.repository.UserRepository;
import com.upiguard.backend.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(
                            null, null, null, null,
                            "Email already registered"
                    ));
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("USER");

        // Save to database
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtils.generateToken(user.getEmail());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new AuthResponse(
                        token,
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole(),
                        "Registration successful"
                ));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user from database
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        // Generate JWT token
        String token = jwtUtils.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                "Login successful"
        ));
    }
}
package com.upiguard.backend.controller;

import com.upiguard.backend.dto.TransactionResponse;
import com.upiguard.backend.entity.User;
import com.upiguard.backend.repository.TransactionRepository;
import com.upiguard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("highRisk", transactionRepository.countByRiskLevel("HIGH"));
        stats.put("mediumRisk", transactionRepository.countByRiskLevel("MEDIUM"));
        stats.put("lowRisk", transactionRepository.countByRiskLevel("LOW"));

        return ResponseEntity.ok(stats);
    }

    // GET /api/admin/transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        List<TransactionResponse> transactions = transactionRepository
                .findAll()
                .stream()
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getSenderUpiId(),
                        t.getReceiverUpiId(),
                        t.getReceiverName(),
                        t.getAmount(),
                        t.getStatus(),
                        t.getFraudScore(),
                        t.getRiskLevel(),
                        t.getCreatedAt(),
                        null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(transactions);
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository
                .findAll()
                .stream()
                .map(u -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", u.getId());
                    userMap.put("fullName", u.getFullName());
                    userMap.put("email", u.getEmail());
                    userMap.put("phone", u.getPhone());
                    userMap.put("role", u.getRole());
                    userMap.put("isActive", u.getIsActive());
                    userMap.put("createdAt", u.getCreatedAt());
                    userMap.put("totalTransactions",
                            transactionRepository.countByUser(u));
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // PUT /api/admin/users/{id}/toggle
    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(
            @PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow();

        // Toggle active status
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User status updated");
        response.put("isActive", user.getIsActive());

        return ResponseEntity.ok(response);
    }
}
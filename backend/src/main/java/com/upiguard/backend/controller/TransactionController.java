package com.upiguard.backend.controller;

import com.upiguard.backend.dto.TransactionRequest;
import com.upiguard.backend.dto.TransactionResponse;
import com.upiguard.backend.entity.Transaction;
import com.upiguard.backend.entity.User;
import com.upiguard.backend.repository.TransactionRepository;
import com.upiguard.backend.repository.UserRepository;
import com.upiguard.backend.service.MlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MlService mlService;

    // POST /api/transactions/submit
    @PostMapping("/submit")
    public ResponseEntity<TransactionResponse> submitTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Get current logged-in user
        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow();

        // Call real ML service for fraud score
        double fraudScore = mlService.getFraudScore(
                request.getSenderUpiId(),
                request.getReceiverUpiId(),
                request.getAmount()
        );

        String riskLevel = getRiskLevel(fraudScore);
        String status = riskLevel.equals("HIGH") ? "FLAGGED" : "SUCCESS";

        // Save transaction
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setSenderUpiId(request.getSenderUpiId());
        transaction.setReceiverUpiId(request.getReceiverUpiId());
        transaction.setReceiverName(request.getReceiverName());
        transaction.setAmount(request.getAmount());
        transaction.setFraudScore(fraudScore);
        transaction.setRiskLevel(riskLevel);
        transaction.setStatus(status);

        Transaction saved = transactionRepository.save(transaction);

        return ResponseEntity.ok(new TransactionResponse(
                saved.getId(),
                saved.getSenderUpiId(),
                saved.getReceiverUpiId(),
                saved.getReceiverName(),
                saved.getAmount(),
                saved.getStatus(),
                saved.getFraudScore(),
                saved.getRiskLevel(),
                saved.getCreatedAt(),
                "Transaction submitted successfully"
        ));
    }

    // GET /api/transactions/history
    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow();

        List<TransactionResponse> history = transactionRepository
                .findByUserOrderByCreatedAtDesc(user)
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

        return ResponseEntity.ok(history);
    }

    private String getRiskLevel(double score) {
        if (score >= 75) return "HIGH";
        if (score >= 40) return "MEDIUM";
        return "LOW";
    }
}
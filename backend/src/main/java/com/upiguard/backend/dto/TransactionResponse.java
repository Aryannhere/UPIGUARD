package com.upiguard.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private String senderUpiId;
    private String receiverUpiId;
    private String receiverName;
    private Double amount;
    private String status;
    private Double fraudScore;
    private String riskLevel;
    private LocalDateTime createdAt;
    private String message;
}
package com.upiguard.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TransactionRequest {

    @NotBlank(message = "Sender UPI ID is required")
    private String senderUpiId;

    @NotBlank(message = "Receiver UPI ID is required")
    private String receiverUpiId;

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
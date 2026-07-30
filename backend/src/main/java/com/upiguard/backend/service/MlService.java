package com.upiguard.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MlService {

    // URL of our Python FastAPI ML service
    private static final String ML_SERVICE_URL = "http://localhost:8000/predict";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Call Python ML service and get fraud score.
     * Returns fraud score between 0 and 100.
     * Falls back to rule-based score if ML service is down.
     */
    public double getFraudScore(String senderUpiId, String receiverUpiId,
                                 double amount) {
        try {
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("senderUpiId",   senderUpiId);
            requestBody.put("receiverUpiId", receiverUpiId);
            requestBody.put("amount",        amount);
            requestBody.put("hour",          LocalDateTime.now().getHour());
            requestBody.put("dayOfWeek",     LocalDateTime.now().getDayOfWeek().getValue());

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            // Call ML service
            ResponseEntity<String> response = restTemplate.postForEntity(
                    ML_SERVICE_URL, entity, String.class
            );

            // Parse response
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("fraud_score").asDouble();

        } catch (Exception e) {
            // ML service is down — use rule-based fallback
            System.out.println("[WARN] ML service unavailable, using fallback: " + e.getMessage());
            return calculateFallbackScore(amount);
        }
    }

    /**
     * Fallback score if ML service is unavailable.
     */
    private double calculateFallbackScore(double amount) {
        if (amount > 8000) return 85.0;
        if (amount > 5000) return 55.0;
        if (amount > 2000) return 30.0;
        return 10.0;
    }
}
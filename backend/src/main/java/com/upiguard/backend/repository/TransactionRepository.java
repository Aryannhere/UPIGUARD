package com.upiguard.backend.repository;

import com.upiguard.backend.entity.Transaction;
import com.upiguard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Get all transactions for a specific user
    List<Transaction> findByUserOrderByCreatedAtDesc(User user);

    // Count transactions by risk level
    long countByRiskLevel(String riskLevel);

    // Count total transactions for a user
    long countByUser(User user);
}
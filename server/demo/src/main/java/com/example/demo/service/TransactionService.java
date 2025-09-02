package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.TransactionRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public BigDecimal getTotalAmountByType(Long userId, String type) {
        if (!type.equalsIgnoreCase("INCOME") && !type.equalsIgnoreCase("EXPENSE")) {
            throw new IllegalArgumentException("Invalid transaction type: " + type);
        }

        return transactionRepository.getTotalAmountByType(userId, type.toUpperCase());
    }

    public BigDecimal getTotalAmountByTypeAndDateRange(Long userId, String type, LocalDateTime startDate,
            LocalDateTime endDate) {
        if (!type.equalsIgnoreCase("INCOME") && !type.equalsIgnoreCase("EXPENSE")) {
            throw new IllegalArgumentException("Invalid transaction type: " + type);
        }

        return transactionRepository.getTotalAmountByTypeAndDateRange(userId, type.toUpperCase(), startDate, endDate);
    }

    public List<Transaction> getRecentTransactions(Long userId, int limit) {
        return transactionRepository
                .findRecentTransactionsByUserId(userId, PageRequest.of(0, limit))
                .getContent();
    }

    public Transaction addTransaction(Transaction transaction, User user) {
        // Set user for the transaction
        transaction.setUser(user);
        // Save the transaction to the database
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public Transaction updateTransactionStatus(Long transactionId, String updatedStatus) {
        // Retrieve the transaction by ID
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Update the status
        transaction.setStatus(updatedStatus);

        // Save the updated transaction
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long transactionId) {
        // Check if the transaction exists
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Delete the transaction
        transactionRepository.delete(transaction);
    }

    public BigDecimal getTotalExpensesByCategory(Long userId, String category) {
        return transactionRepository.getTotalExpensesByCategory(userId, category);
    }

    public BigDecimal getTotalByTypeCategoryAndDateRange(Long userId, String type, String category,
            LocalDateTime startDate, LocalDateTime endDate) {
        // Normalize type if provided
        String normalizedType = null;
        if (type != null && (type.equalsIgnoreCase("INCOME") || type.equalsIgnoreCase("EXPENSE"))) {
            normalizedType = type.toUpperCase();
        }

        return transactionRepository.getTotalByTypeCategoryAndDateRange(
                userId, normalizedType, category, startDate, endDate);
    }

}

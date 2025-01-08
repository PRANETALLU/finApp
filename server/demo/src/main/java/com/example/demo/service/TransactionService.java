package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.TransactionRepository;

import java.math.BigDecimal;
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
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Update the status
        transaction.setStatus(updatedStatus);

        // Save the updated transaction
        return transactionRepository.save(transaction);
    }
}

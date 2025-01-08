package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.demo.model.Transaction;
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
}

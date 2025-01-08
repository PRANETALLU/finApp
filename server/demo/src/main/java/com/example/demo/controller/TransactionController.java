package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/total")
    public BigDecimal getTotalAmountByType(@RequestParam Long userId, @RequestParam String type) {
        return transactionService.getTotalAmountByType(userId, type);
    }

    @GetMapping("/recent")
    public List<Transaction> getRecentTransactions(@RequestParam Long userId, @RequestParam int limit) {
        return transactionService.getRecentTransactions(userId, limit);
    }
}


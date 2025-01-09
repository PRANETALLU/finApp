package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.StatusUpdateRequest;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.service.TransactionService;
import com.example.demo.service.UserService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService; 

    @GetMapping("/total")
    public BigDecimal getTotalAmountByType(@RequestParam Long userId, @RequestParam String type) {
        return transactionService.getTotalAmountByType(userId, type);
    }

    @GetMapping("/recent")
    public List<Transaction> getRecentTransactions(@RequestParam Long userId, @RequestParam int limit) {
        return transactionService.getRecentTransactions(userId, limit);
    }

    @PostMapping("/add")
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction) {
        // Get the current logged-in user's details from the SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Fetch the user from the userService (implement user fetching logic from your database)
        User user = userService.findByUsername(username); // Or use the user ID from the JWT token if applicable

        if (user == null) {
            return ResponseEntity.status(404).body(null); // User not found
        }

        // Set the date of the transaction if not provided
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDateTime.now()); // Use the current time if no date is provided
        }

        // Add the transaction using the service
        Transaction savedTransaction = transactionService.addTransaction(transaction, user);
        
        // Return the saved transaction
        return ResponseEntity.status(201).body(savedTransaction);
    }

    @GetMapping("/{userId}")
    public List<Transaction> getTransactions(@PathVariable String userId) {
        return transactionService.getTransactionsByUserId(Long.parseLong(userId));
    }

    @PatchMapping("/changeStatus/{transactionId}")
    public ResponseEntity<Transaction> changeStatus(@PathVariable Long transactionId, @RequestBody StatusUpdateRequest statusUpdateRequest) {
        // Determine updated status
        String updatedStatus = statusUpdateRequest.getStatus();
        
        // Update the transaction status using the service
        Transaction updatedTransaction = transactionService.updateTransactionStatus(transactionId, updatedStatus);

        // Return the updated transaction in response
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/delete/{transactionId}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long transactionId) {
        try {
            // Call the service to delete the transaction
            transactionService.deleteTransaction(transactionId);
            return ResponseEntity.ok("Transaction deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Transaction not found");
        }
    }
}


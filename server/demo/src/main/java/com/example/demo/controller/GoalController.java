package com.example.demo.controller;

import com.example.demo.model.Goal;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.service.GoalService;
import com.example.demo.service.TransactionService;
import com.example.demo.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:3000")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public List<Goal> getGoalsByUserId(@PathVariable String userId) {
        return goalService.getGoalsByUserId(Long.parseLong(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createGoal(@PathVariable String userId, @RequestBody Goal goal) {
        try {
            // Attempt to create the goal
            Goal createdGoal = goalService.createGoal(Long.parseLong(userId), goal);
            return ResponseEntity.ok(createdGoal);
        } catch (NumberFormatException e) {
            // Handle the case where the userId is not a valid number
            return ResponseEntity.badRequest().body("Invalid user ID format. Please provide a valid number.");
        } catch (IllegalArgumentException e) {
            // Handle the case where the input is invalid
            return ResponseEntity.badRequest().body("Invalid goal details. " + e.getMessage());
        } catch (Exception e) {
            // Catch any unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating the goal: " + e.getMessage());
        }
    }

    @PutMapping("/{goalId}/add-saved-amount")
    public ResponseEntity<?> updateSavedAmount(
            @PathVariable Long goalId,
            @RequestBody Map<String, BigDecimal> requestBody) {
        try {
            // Extract the "amount" field from the request body
            BigDecimal amount = requestBody.get("amount");
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Amount must be a positive number.");
            }

            // Update the goal with the new saved amount
            Goal updatedGoal = goalService.updateSavedAmount(goalId, amount);

            // Retrieve the current authenticated user's username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userService.findByUsername(username);

            // Create a new transaction record
            Transaction transaction = new Transaction();
            transaction.setAmount(amount);
            transaction.setCategory("Savings Contribution");
            transaction.setDate(LocalDateTime.now());
            transaction.setDescription("Transferred to Goal: " + updatedGoal.getName());
            transaction.setPaymentMethod("System Credits"); // Default payment method
            transaction.setStatus("completed");
            transaction.setType("EXPENSE");
            transaction.setUser(user); // Set the current user for the transaction

            // Save the transaction
            transactionService.addTransaction(transaction, user);

            // Return the updated goal
            return ResponseEntity.ok(updatedGoal);
        } catch (Exception e) {
            // Handle any potential errors during the update and transaction creation
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long goalId) {
        try {
            // Find the goal by ID
            Goal goal = goalService.findGoalById(goalId);

            // If goal doesn't exist, return an error
            if (goal == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Goal with ID " + goalId + " not found.");
            }

            // Retrieve the authenticated user's username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userService.findByUsername(username);

            // Transfer funds only if the savedAmount is greater than 0
            if (goal.getSavedAmount().compareTo(BigDecimal.ZERO) > 0) {
                // Create a transaction to transfer the funds back to net savings
                Transaction transaction = new Transaction();
                transaction.setAmount(goal.getSavedAmount());
                transaction.setCategory("Savings Reclaim");
                transaction.setDate(LocalDateTime.now());
                transaction.setDescription("Reclaimed funds from deleted goal: " + goal.getName());
                transaction.setPaymentMethod("System Credits");
                transaction.setStatus("completed");
                transaction.setType("INCOME");
                transaction.setUser(user);

                // Save the transaction
                transactionService.addTransaction(transaction, user);
            }

            // Delete the goal
            goalService.deleteGoal(goalId);

            // Return success response
            return ResponseEntity.ok("Goal deleted successfully, and funds transferred to net savings.");
        } catch (Exception e) {
            // Handle unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the goal: " + e.getMessage());
        }
    }

}

package com.example.demo.controller;

import com.example.demo.model.Budget;
import com.example.demo.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Get all budgets for a specific user
    @GetMapping("/{userId}")
    public ResponseEntity<List<Budget>> getAllBudgets(@PathVariable Long userId) {
        List<Budget> budgets = budgetService.getBudgetsByUserId(userId);
        if (budgets.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(budgets);
    }

    // Get a specific budget for a user by ID
    @GetMapping("/{userId}/{budgetId}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long userId, @PathVariable Long budgetId) {
        Optional<Budget> budget = budgetService.getBudgetById(userId, budgetId);
        return budget.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create a new budget for a specific user
    @PostMapping("/{userId}")
    public ResponseEntity<?> createBudget(@PathVariable Long userId, @RequestBody Budget budget) {
        try {
            Budget savedBudget = budgetService.saveBudget(userId, budget);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBudget);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid budget or user ID.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // Update an existing budget for a user
    @PutMapping("/{userId}/{budgetId}")
    public ResponseEntity<?> updateBudget(@PathVariable Long userId, @PathVariable Long budgetId,
                                          @RequestBody Budget budget) {
        Optional<Budget> existingBudget = budgetService.getBudgetById(userId, budgetId);
        if (existingBudget.isPresent()) {
            budget.setId(budgetId); // Set the ID to ensure correct update
            Budget updatedBudget = budgetService.saveBudget(userId, budget);
            return ResponseEntity.ok(updatedBudget);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Budget not found for the given user ID and budget ID.");
        }
    }

    // Delete a budget for a user by ID
    @DeleteMapping("/{userId}/{budgetId}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long userId, @PathVariable Long budgetId) {
        Optional<Budget> existingBudget = budgetService.getBudgetById(userId, budgetId);
        if (existingBudget.isPresent()) {
            budgetService.deleteBudget(userId, budgetId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Budget not found for the given user ID and budget ID.");
        }
    }
}

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
@RequestMapping("/api/users/{userId}/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Get all budgets for a specific user
    @GetMapping
    public List<Budget> getAllBudgets(@PathVariable Long userId) {
        return budgetService.getBudgetsByUserId(userId);
    }

    // Get a specific budget for a user by ID
    @GetMapping("/{budgetId}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long userId, @PathVariable Long budgetId) {
        Optional<Budget> budget = budgetService.getBudgetById(userId, budgetId);
        return budget.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create or update a budget for a specific user
    @PostMapping
    public ResponseEntity<Budget> createBudget(@PathVariable Long userId, @RequestBody Budget budget) {
        Budget savedBudget = budgetService.saveBudget(userId, budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBudget);
    }

    // Update an existing budget for a user
    @PutMapping("/{budgetId}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long userId, @PathVariable Long budgetId, @RequestBody Budget budget) {
        Optional<Budget> existingBudget = budgetService.getBudgetById(userId, budgetId);
        if (existingBudget.isPresent()) {
            budget.setId(budgetId);
            Budget updatedBudget = budgetService.saveBudget(userId, budget);
            return ResponseEntity.ok(updatedBudget);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Delete a budget for a user by ID
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long userId, @PathVariable Long budgetId) {
        Optional<Budget> existingBudget = budgetService.getBudgetById(userId, budgetId);
        if (existingBudget.isPresent()) {
            budgetService.deleteBudget(userId, budgetId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

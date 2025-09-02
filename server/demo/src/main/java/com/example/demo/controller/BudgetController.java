package com.example.demo.controller;

import com.example.demo.model.Budget;
import com.example.demo.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Get all budgets for a specific user (with auto-reset applied)
    @GetMapping("/{userId}")
    public ResponseEntity<List<Budget>> getAllBudgets(@PathVariable Long userId) {
        List<Budget> budgets = budgetService.getBudgetsByUserId(userId);
        if (budgets.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(budgets);
    }

    // Get a specific budget for a user by ID (with auto-reset applied)
    @GetMapping("/{userId}/{budgetId}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long userId, @PathVariable Long budgetId) {
        Optional<Budget> budget = budgetService.getBudgetById(userId, budgetId);
        return budget.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create a new budget
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

    // Update an existing budget
    @PutMapping("/{userId}/{budgetId}")
    public ResponseEntity<?> updateBudget(@PathVariable Long userId, @PathVariable Long budgetId,
                                          @RequestBody Budget budget) {
        Optional<Budget> existingBudget = budgetService.getBudgetById(userId, budgetId);
        if (existingBudget.isPresent()) {
            budget.setId(budgetId); // ensure correct update
            Budget updatedBudget = budgetService.saveBudget(userId, budget);
            return ResponseEntity.ok(updatedBudget);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Budget not found for the given user ID and budget ID.");
        }
    }

    // Update spent amount for a budget
    @PatchMapping("/{userId}/{budgetId}/spent")
    public ResponseEntity<?> updateSpentAmount(@PathVariable Long userId, 
                                               @PathVariable Long budgetId, 
                                               @RequestBody Map<String, BigDecimal> request) {
        try {
            BigDecimal spentAmount = request.get("spentAmount");
            if (spentAmount == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("spentAmount is required");
            }
            
            Budget updatedBudget = budgetService.updateSpentAmount(userId, budgetId, spentAmount);
            return ResponseEntity.ok(updatedBudget);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // Add to spent amount for a budget (useful when adding new expenses)
    @PatchMapping("/{userId}/{budgetId}/spent/add")
    public ResponseEntity<?> addToSpentAmount(@PathVariable Long userId, 
                                              @PathVariable Long budgetId, 
                                              @RequestBody Map<String, BigDecimal> request) {
        try {
            BigDecimal amountToAdd = request.get("amount");
            if (amountToAdd == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("amount is required");
            }
            
            Budget updatedBudget = budgetService.addToSpentAmount(userId, budgetId, amountToAdd);
            return ResponseEntity.ok(updatedBudget);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // Force reset a budget (useful for testing or manual resets)
    @PostMapping("/{userId}/{budgetId}/reset")
    public ResponseEntity<?> forceResetBudget(@PathVariable Long userId, @PathVariable Long budgetId) {
        try {
            Budget resetBudget = budgetService.forceResetBudget(userId, budgetId);
            return ResponseEntity.ok(resetBudget);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // Get budgets that need reset (for admin/debugging purposes)
    @GetMapping("/admin/needs-reset")
    public ResponseEntity<List<Budget>> getBudgetsNeedingReset() {
        try {
            List<Budget> budgets = budgetService.getBudgetsNeedingReset();
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a budget
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
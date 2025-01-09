package com.example.demo.service;

import com.example.demo.model.Budget;
import com.example.demo.model.User;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository; 

    // Create or update a budget for a specific user
    public Budget saveBudget(Long userId, Budget budget) {
        if (budget == null) {
            throw new IllegalArgumentException("Budget cannot be null.");
        }
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
        budget.setUser(user); // Set the user ID
        return budgetRepository.save(budget);
    }

    // Get a budget by its ID and user ID
    public Optional<Budget> getBudgetById(Long userId, Long budgetId) {
        return budgetRepository.findById(budgetId)
                .filter(budget -> budget.getUser().getId().equals(userId));
    }

    // Get all budgets for a specific user
    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    // Delete a budget by its ID and user ID
    public void deleteBudget(Long userId, Long budgetId) {
        Optional<Budget> budget = budgetRepository.findById(budgetId);
        if (budget.isPresent() && budget.get().getUser().getId().equals(userId)) {
            budgetRepository.deleteById(budgetId);
        } else {
            throw new IllegalArgumentException("Budget not found or does not belong to the specified user.");
        }
    }
}

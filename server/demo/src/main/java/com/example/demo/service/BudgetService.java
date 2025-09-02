package com.example.demo.service;

import com.example.demo.model.Budget;
import com.example.demo.model.User;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
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
        budget.setUser(user);

        // Initialize new budgets with proper defaults
        if (budget.getSpentAmount() == null) {
            budget.setSpentAmount(BigDecimal.ZERO);
        }
        if (budget.getLastResetDate() == null) {
            budget.setLastResetDate(getCurrentPeriodStart(budget.getBudgetType()));
        }

        return budgetRepository.save(budget);
    }

    // Get a budget by its ID and user ID (with reset check)
    public Optional<Budget> getBudgetById(Long userId, Long budgetId) {
        return budgetRepository.findById(budgetId)
                .filter(budget -> budget.getUser().getId().equals(userId))
                .map(this::checkAndResetBudget);
    }

    // Get all budgets for a specific user (with reset check)
    public List<Budget> getBudgetsByUserId(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        budgets.forEach(this::checkAndResetBudget);
        return budgets;
    }

    // Update spent amount for a budget
    public Budget updateSpentAmount(Long userId, Long budgetId, BigDecimal newSpentAmount) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            if (!budget.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Budget does not belong to the specified user.");
            }

            // Check and reset budget first
            budget = checkAndResetBudget(budget);

            // Update spent amount
            budget.setSpentAmount(newSpentAmount);
            return budgetRepository.save(budget);
        } else {
            throw new IllegalArgumentException("Budget not found.");
        }
    }

    // Add to spent amount (useful when adding new expenses)
    public Budget addToSpentAmount(Long userId, Long budgetId, BigDecimal amountToAdd) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            if (!budget.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Budget does not belong to the specified user.");
            }

            // Check and reset budget first
            budget = checkAndResetBudget(budget);

            // Add to spent amount
            BigDecimal currentSpent = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
            budget.setSpentAmount(currentSpent.add(amountToAdd));
            return budgetRepository.save(budget);
        } else {
            throw new IllegalArgumentException("Budget not found.");
        }
    }

    // Helper method to get the current period start date
    private LocalDate getCurrentPeriodStart(String budgetType) {
        LocalDate today = LocalDate.now();

        if ("monthly".equalsIgnoreCase(budgetType)) {
            return today.withDayOfMonth(1); // Start of the current month
        } else if ("yearly".equalsIgnoreCase(budgetType)) {
            return today.withDayOfYear(1); // Start of the current year
        }

        return today; // fallback
    }

    // Enhanced auto-reset logic for rolling budgets
    private Budget checkAndResetBudget(Budget budget) {
        LocalDate today = LocalDate.now();
        LocalDate newResetDate = null;

        if ("monthly".equalsIgnoreCase(budget.getBudgetType())) {
            LocalDate nextResetDate = budget.getLastResetDate().plusMonths(1);

            if (!today.isBefore(nextResetDate)) { // today >= nextResetDate
                newResetDate = nextResetDate; // reset to next period start
            }
        } else if ("yearly".equalsIgnoreCase(budget.getBudgetType())) {
            LocalDate nextResetDate = budget.getLastResetDate().plusYears(1);

            if (!today.isBefore(nextResetDate)) { // today >= nextResetDate
                newResetDate = nextResetDate;
            }
        }

        if (newResetDate != null) {
            budget.setSpentAmount(BigDecimal.ZERO);
            budget.setLastResetDate(newResetDate);
            budget = budgetRepository.save(budget);

            System.out.println("[RESET] Budget for user " + budget.getUser().getId() +
                    ", category=" + budget.getCategory() +
                    ", type=" + budget.getBudgetType() +
                    ", lastResetDate=" + newResetDate);
        }

        return budget;
    }

    // Force reset a budget (useful for testing or manual resets)
    public Budget forceResetBudget(Long userId, Long budgetId) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            if (!budget.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Budget does not belong to the specified user.");
            }

            budget.setSpentAmount(BigDecimal.ZERO);
            budget.setLastResetDate(getCurrentPeriodStart(budget.getBudgetType()));
            return budgetRepository.save(budget);
        } else {
            throw new IllegalArgumentException("Budget not found.");
        }
    }

    // Get budgets that need to be reset (for batch processing)
    public List<Budget> getBudgetsNeedingReset() {
        List<Budget> allBudgets = budgetRepository.findAll();
        return allBudgets.stream()
                .filter(this::budgetNeedsReset)
                .toList();
    }

    // Check if a budget needs reset without actually resetting it
    private boolean budgetNeedsReset(Budget budget) {
        LocalDate today = LocalDate.now();

        if ("monthly".equalsIgnoreCase(budget.getBudgetType())) {
            LocalDate currentMonthStart = YearMonth.from(today).atDay(1);
            return budget.getLastResetDate() == null ||
                    budget.getLastResetDate().isBefore(currentMonthStart);
        } else if ("yearly".equalsIgnoreCase(budget.getBudgetType())) {
            return budget.getLastResetDate() == null ||
                    budget.getLastResetDate().getYear() < today.getYear();
        }

        return false;
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
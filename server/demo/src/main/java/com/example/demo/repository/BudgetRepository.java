package com.example.demo.repository;

import com.example.demo.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    // Find budgets by user ID
    List<Budget> findByUserId(Long userId);
}

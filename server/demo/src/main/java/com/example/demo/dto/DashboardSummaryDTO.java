package com.example.demo.dto;

import com.example.demo.model.Transaction;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private List<Transaction> recentTransactions;

    public DashboardSummaryDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netSavings, List<Transaction> recentTransactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netSavings = netSavings;
        this.recentTransactions = recentTransactions;
    }

    // Getters and Setters
    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getNetSavings() {
        return netSavings;
    }

    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }

    public List<Transaction> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<Transaction> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}

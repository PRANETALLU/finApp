package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String reportType; // E.g., "Spending Report", "Income vs Expenses"
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;

    // Constructors, getters, setters
    public Report() {}

    public Report(User user, String reportType, BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netSavings) {
        this.user = user;
        this.reportType = reportType;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netSavings = netSavings;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

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

    @Override
    public String toString() {
        return "Report{" +
                "id=" + id +
                ", reportType='" + reportType + '\'' +
                ", totalIncome=" + totalIncome +
                ", totalExpense=" + totalExpense +
                ", netSavings=" + netSavings +
                '}';
    }
}

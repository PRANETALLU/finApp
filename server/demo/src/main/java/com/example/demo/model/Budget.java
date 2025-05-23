package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String category;  // E.g., "Groceries", "Entertainment"
    
    private BigDecimal amount;  // Set budget amount

    private String description; // Description
    
    private BigDecimal spentAmount = BigDecimal.ZERO;  // Track spent amount, default to 0

    private String budgetType;  // "monthly" or "yearly"

    private LocalDateTime startDate; // Start date (e.g., first of the month)
    private LocalDateTime endDate;   // End date (e.g., last day of the month or year)

    // Constructors, getters, setters
    public Budget() {}

    public Budget(User user, String category, BigDecimal amount, String description, String budgetType, LocalDateTime startDate, LocalDateTime endDate) {
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.budgetType = budgetType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    @Transient
    public BigDecimal getRemainingAmount() {
        return amount.subtract(spentAmount);
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBudgetType() {
        return budgetType;
    }

    public void setBudgetType(String budgetType) {
        this.budgetType = budgetType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    @Override
    public String toString() {
        return "Budget{" +
                "id=" + id +
                ", user=" + user.getId() +
                ", category='" + category + '\'' +
                ", amount=" + amount +
                ", spentAmount=" + spentAmount +
                ", remainingAmount=" + getRemainingAmount() +
                ", description='" + description + '\'' +
                ", budgetType='" + budgetType + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}


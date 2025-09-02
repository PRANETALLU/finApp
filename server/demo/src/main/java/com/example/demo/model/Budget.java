package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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

    @Column(nullable = false)
    private BigDecimal amount;  // Budgeted amount

    private String description; // Optional description

    @Column(nullable = false)
    private BigDecimal spentAmount = BigDecimal.ZERO;  // Track spent amount

    @Column(nullable = false)
    private String budgetType;  // "monthly" or "yearly"

    // Track when this budget was last reset
    private LocalDate lastResetDate;

    // --- Constructors ---
    public Budget() {}

    public Budget(User user, String category, BigDecimal amount, String description, String budgetType) {
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.budgetType = budgetType;
        this.spentAmount = BigDecimal.ZERO;
        this.lastResetDate = LocalDate.now();
    }

    // --- Utility ---
    @Transient
    public BigDecimal getRemainingAmount() {
        return amount.subtract(spentAmount);
    }

    // --- Getters & Setters ---
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public String getBudgetType() {
        return budgetType;
    }

    public void setBudgetType(String budgetType) {
        this.budgetType = budgetType;
    }

    public LocalDate getLastResetDate() {
        return lastResetDate;
    }

    public void setLastResetDate(LocalDate lastResetDate) {
        this.lastResetDate = lastResetDate;
    }

    @Override
    public String toString() {
        return "Budget{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", category='" + category + '\'' +
                ", amount=" + amount +
                ", spentAmount=" + spentAmount +
                ", remainingAmount=" + getRemainingAmount() +
                ", description='" + description + '\'' +
                ", budgetType='" + budgetType + '\'' +
                ", lastResetDate=" + lastResetDate +
                '}';
    }
}


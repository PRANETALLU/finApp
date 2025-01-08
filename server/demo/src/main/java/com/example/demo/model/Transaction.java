package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal amount;
    private String category;
    private String description;

    private String type; // "INCOME" or "EXPENSE" as a String

    private LocalDateTime date;

    private String status; // e.g., "completed", "pending"
    private String paymentMethod; // e.g., "credit card", "bank transfer"

    // Constructors, getters, setters
    public Transaction() {}

    public Transaction(User user, BigDecimal amount, String category, String description,
                       String type, LocalDateTime date, String status, String paymentMethod) {
        this.user = user;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.type = type; // Now a String instead of TransactionType enum
        this.date = date;
        this.status = status;
        this.paymentMethod = paymentMethod;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type; // Returns type as a String
    }

    public void setType(String type) {
        this.type = type; // Now accepting type as String
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", user=" + user.getId() +
                ", amount=" + amount +
                ", category='" + category + '\'' +
                ", description='" + description + '\'' +
                ", type='" + type + '\'' +
                ", date=" + date +
                ", status='" + status + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}

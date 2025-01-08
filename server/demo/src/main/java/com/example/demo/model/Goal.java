package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;  // E.g., "Vacation Fund", "Emergency Fund"
    private BigDecimal targetAmount;  // Amount to save
    private BigDecimal savedAmount = BigDecimal.ZERO;  // Current savings amount

    // Constructors, getters, setters
    public Goal() {}

    public Goal(User user, String name, BigDecimal targetAmount) {
        this.user = user;
        this.name = name;
        this.targetAmount = targetAmount;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getSavedAmount() {
        return savedAmount;
    }

    public void setSavedAmount(BigDecimal savedAmount) {
        this.savedAmount = savedAmount;
    }

    @Override
    public String toString() {
        return "Goal{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", targetAmount=" + targetAmount +
                ", savedAmount=" + savedAmount +
                '}';
    }
}

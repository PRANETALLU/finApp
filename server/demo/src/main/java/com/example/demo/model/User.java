package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String role;

    @Column
    private Integer incomeAllow;

    @Column
    private Integer age; // Changed to Integer

    @Column
    private Integer setAmount; // Changed to Integer

    // Constructors
    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password; 
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getIncomeAllow() {
        return incomeAllow;
    }

    public void setIncomeAllow(Integer incomeAllow) { // Updated to Integer
        this.incomeAllow = incomeAllow;
    }

    public Integer getAge() {
        return age; // Updated to Integer
    }

    public void setAge(Integer age) { // Updated to Integer
        this.age = age;
    }

    public Integer getSetAmount() {
        return setAmount; // Updated to Integer
    }

    public void setSetAmount(Integer setAmount) { // Updated to Integer
        this.setAmount = setAmount;
    }
}

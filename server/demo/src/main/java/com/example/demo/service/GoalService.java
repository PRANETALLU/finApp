package com.example.demo.service;

import com.example.demo.model.Goal;
import com.example.demo.model.User;
import com.example.demo.repository.GoalRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository; 

    public List<Goal> getGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Goal createGoal(Long userId, Goal goal) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
        goal.setUser(user);
        return goalRepository.save(goal);
    }

    public Goal updateSavedAmount(Long goalId, BigDecimal amount) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setSavedAmount(goal.getSavedAmount().add(amount));
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long goalId) {
        goalRepository.deleteById(goalId);
    }

    public Goal findGoalById(Long goalId) {
        return goalRepository.findById(goalId)
                .orElseThrow(() -> new NoSuchElementException("Goal with ID " + goalId + " not found."));
    }
}

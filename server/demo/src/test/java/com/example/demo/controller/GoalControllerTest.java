package com.example.demo.controller;

import com.example.demo.model.Goal;
import com.example.demo.model.User;
import com.example.demo.service.GoalService;
import com.example.demo.service.TransactionService;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoalControllerTest {

    @Mock
    private GoalService goalService;

    @Mock
    private TransactionService transactionService;

    @Mock
    private UserService userService;

    @InjectMocks
    private GoalController goalController;

    private Goal goal;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
        goal = new Goal(user, "Vacation Fund", BigDecimal.valueOf(2000));
        goal.setId(1L);
    }

    @Test
    void testGetGoalsByUserId() {
        when(goalService.getGoalsByUserId(1L)).thenReturn(List.of(goal));
        List<Goal> goals = goalController.getGoalsByUserId("1");
        assertEquals(1, goals.size());
    }

    @Test
    void testCreateGoalSuccess() {
        when(goalService.createGoal(1L, goal)).thenReturn(goal);
        ResponseEntity<?> response = goalController.createGoal("1", goal);
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Goal);
    }

    @Test
    void testCreateGoalInvalidUserId() {
        ResponseEntity<?> response = goalController.createGoal("abc", goal);
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void testUpdateSavedAmountInvalidAmount() {
        Map<String, BigDecimal> request = new HashMap<>();
        request.put("amount", BigDecimal.ZERO);
        ResponseEntity<?> response = goalController.updateSavedAmount(1L, request);
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void testDeleteGoalNotFound() {
        when(goalService.findGoalById(1L)).thenReturn(null);
        ResponseEntity<?> response = goalController.deleteGoal(1L);
        assertEquals(404, response.getStatusCodeValue());
    }
}

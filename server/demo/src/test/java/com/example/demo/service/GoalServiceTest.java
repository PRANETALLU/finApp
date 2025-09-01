package com.example.demo.service;

import com.example.demo.model.Goal;
import com.example.demo.model.User;
import com.example.demo.repository.GoalRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GoalService goalService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
    }

    @Test
    void testGetGoalsByUserId() {
        Goal goal = new Goal(user, "Vacation Fund", BigDecimal.valueOf(2000));
        when(goalRepository.findByUserId(1L)).thenReturn(Arrays.asList(goal));

        assertEquals(1, goalService.getGoalsByUserId(1L).size());
        verify(goalRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testCreateGoal() {
        Goal goal = new Goal(user, "Emergency Fund", BigDecimal.valueOf(5000));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalRepository.save(goal)).thenReturn(goal);

        Goal savedGoal = goalService.createGoal(1L, goal);
        assertEquals("Emergency Fund", savedGoal.getName());
    }

    @Test
    void testUpdateSavedAmount() {
        Goal goal = new Goal(user, "Vacation Fund", BigDecimal.valueOf(2000));
        goal.setId(1L);

        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenReturn(goal);

        Goal updatedGoal = goalService.updateSavedAmount(1L, BigDecimal.valueOf(500));
        assertEquals(BigDecimal.valueOf(500), updatedGoal.getSavedAmount());
    }

    @Test
    void testDeleteGoal() {
        goalService.deleteGoal(1L);
        verify(goalRepository, times(1)).deleteById(1L);
    }

    @Test
    void testFindGoalByIdThrowsException() {
        when(goalRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> goalService.findGoalById(99L));
    }
}

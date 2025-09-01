package com.example.demo.service;

import com.example.demo.model.Budget;
import com.example.demo.model.User;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User user;
    private Budget budget;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        user = new User();
        user.setId(1L);
        user.setUsername("testUser");

        budget = new Budget(
                user,
                "Entertainment",
                new BigDecimal("200.00"),
                "Movies & dining out",
                "monthly",
                LocalDateTime.now().withDayOfMonth(1),
                LocalDateTime.now().withDayOfMonth(30)
        );
        budget.setId(1L);
    }

    @Test
    void testSaveBudget_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.save(budget)).thenReturn(budget);

        Budget saved = budgetService.saveBudget(1L, budget);

        assertThat(saved.getCategory()).isEqualTo("Entertainment");
        assertThat(saved.getRemainingAmount()).isEqualByComparingTo("200.00");
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    void testSaveBudget_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> budgetService.saveBudget(1L, budget));
    }

    @Test
    void testGetBudgetById_Success() {
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));

        Optional<Budget> result = budgetService.getBudgetById(1L, 1L);

        assertThat(result).isPresent();
        assertThat(result.get().getCategory()).isEqualTo("Entertainment");
    }

    @Test
    void testDeleteBudget_Success() {
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));

        budgetService.deleteBudget(1L, 1L);

        verify(budgetRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteBudget_NotFound() {
        when(budgetRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> budgetService.deleteBudget(1L, 1L));
    }
}

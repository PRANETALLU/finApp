package com.example.demo.controller;

import com.example.demo.model.Budget;
import com.example.demo.model.User;
import com.example.demo.service.BudgetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BudgetController.class)
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BudgetService budgetService;

    @Autowired
    private ObjectMapper objectMapper;

    private Budget createBudget(User user) {
        return new Budget(
                user,
                "Groceries",
                new BigDecimal("300.00"),
                "Food & supplies",
                "monthly",
                LocalDateTime.now().withDayOfMonth(1),
                LocalDateTime.now().withDayOfMonth(30)
        );
    }

    @Test
    void testGetAllBudgets_Success() throws Exception {
        User user = new User();
        user.setId(1L);

        Budget budget = createBudget(user);
        budget.setId(1L);

        Mockito.when(budgetService.getBudgetsByUserId(1L))
                .thenReturn(Arrays.asList(budget));

        mockMvc.perform(get("/api/budgets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Groceries"))
                .andExpect(jsonPath("$[0].amount").value(300.00));
    }

    @Test
    void testGetBudgetById_NotFound() throws Exception {
        Mockito.when(budgetService.getBudgetById(1L, 1L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/budgets/1/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateBudget_Success() throws Exception {
        User user = new User();
        user.setId(1L);
        Budget budget = createBudget(user);
        budget.setId(1L);

        Mockito.when(budgetService.saveBudget(eq(1L), any(Budget.class)))
                .thenReturn(budget);

        mockMvc.perform(post("/api/budgets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budget)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("Groceries"))
                .andExpect(jsonPath("$.amount").value(300.00));
    }

    @Test
    void testUpdateBudget_NotFound() throws Exception {
        User user = new User();
        user.setId(1L);
        Budget budget = createBudget(user);

        Mockito.when(budgetService.getBudgetById(1L, 1L))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/budgets/1/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budget)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteBudget_Success() throws Exception {
        User user = new User();
        user.setId(1L);
        Budget budget = createBudget(user);
        budget.setId(1L);

        Mockito.when(budgetService.getBudgetById(1L, 1L))
                .thenReturn(Optional.of(budget));

        mockMvc.perform(delete("/api/budgets/1/1"))
                .andExpect(status().isNoContent());
    }
}

package com.example.demo.controller;

import com.example.demo.dto.StatusUpdateRequest;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.service.TransactionService;
import com.example.demo.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private Transaction createTransaction(User user) {
        return new Transaction(user,
                new BigDecimal("100.00"),
                "Groceries",
                "Shopping",
                "EXPENSE",
                LocalDateTime.now(),
                "completed",
                "cash");
    }

    @Test
    void testGetTotalAmountByType() throws Exception {
        Mockito.when(transactionService.getTotalAmountByType(1L, "EXPENSE"))
                .thenReturn(new BigDecimal("200.00"));

        mockMvc.perform(get("/api/transactions/total")
                        .param("userId", "1")
                        .param("type", "EXPENSE"))
                .andExpect(status().isOk())
                .andExpect(content().string("200.00"));
    }

    @Test
    @WithMockUser(username = "testUser")
    void testAddTransaction_Success() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("testUser");

        Transaction transaction = createTransaction(user);
        transaction.setId(1L);

        Mockito.when(userService.findByUsername("testUser")).thenReturn(user);
        Mockito.when(transactionService.addTransaction(any(Transaction.class), eq(user)))
                .thenReturn(transaction);

        mockMvc.perform(post("/api/transactions/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void testGetTransactionsByUserId() throws Exception {
        User user = new User();
        user.setId(1L);

        Transaction transaction = createTransaction(user);
        transaction.setId(1L);

        Mockito.when(transactionService.getTransactionsByUserId(1L))
                .thenReturn(Collections.singletonList(transaction));

        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Groceries"));
    }

    @Test
    void testChangeStatus() throws Exception {
        User user = new User();
        user.setId(1L);
        Transaction transaction = createTransaction(user);
        transaction.setId(1L);
        transaction.setStatus("pending");

        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("pending");

        Mockito.when(transactionService.updateTransactionStatus(1L, "pending"))
                .thenReturn(transaction);

        mockMvc.perform(patch("/api/transactions/changeStatus/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("pending"));
    }

    @Test
    void testDeleteTransaction_NotFound() throws Exception {
        Mockito.doThrow(new RuntimeException("Transaction not found"))
                .when(transactionService).deleteTransaction(1L);

        mockMvc.perform(delete("/api/transactions/delete/1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Transaction not found"));
    }
}

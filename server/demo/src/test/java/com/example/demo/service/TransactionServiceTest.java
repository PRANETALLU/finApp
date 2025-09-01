package com.example.demo.service;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        user = new User();
        user.setId(1L);
        user.setUsername("testUser");

        transaction = new Transaction(user,
                new BigDecimal("100.00"),
                "Food",
                "Dinner",
                "EXPENSE",
                LocalDateTime.now(),
                "completed",
                "cash");
        transaction.setId(1L);
    }

    @Test
    void testGetTotalAmountByType_Valid() {
        when(transactionRepository.getTotalAmountByType(1L, "EXPENSE")).thenReturn(new BigDecimal("100.00"));

        BigDecimal result = transactionService.getTotalAmountByType(1L, "EXPENSE");

        assertThat(result).isEqualByComparingTo("100.00");
    }

    @Test
    void testGetTotalAmountByType_Invalid() {
        assertThrows(IllegalArgumentException.class, () -> transactionService.getTotalAmountByType(1L, "INVALID"));
    }

    @Test
    void testGetRecentTransactions() {
        when(transactionRepository.findRecentTransactionsByUserId(1L, PageRequest.of(0, 5)))
                .thenReturn(new PageImpl<>(Arrays.asList(transaction)));

        assertThat(transactionService.getRecentTransactions(1L, 5)).hasSize(1);
    }

    @Test
    void testAddTransaction() {
        when(transactionRepository.save(transaction)).thenReturn(transaction);

        Transaction saved = transactionService.addTransaction(transaction, user);

        assertThat(saved.getUser().getUsername()).isEqualTo("testUser");
        verify(transactionRepository, times(1)).save(transaction);
    }

    @Test
    void testUpdateTransactionStatus() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(transactionRepository.save(transaction)).thenReturn(transaction);

        Transaction updated = transactionService.updateTransactionStatus(1L, "pending");

        assertThat(updated.getStatus()).isEqualTo("pending");
    }

    @Test
    void testDeleteTransaction_NotFound() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> transactionService.deleteTransaction(1L));
    }

    @Test
    void testGetTotalExpensesByCategory() {
        when(transactionRepository.getTotalExpensesByCategory(1L, "Food")).thenReturn(new BigDecimal("75.00"));

        BigDecimal total = transactionService.getTotalExpensesByCategory(1L, "Food");

        assertThat(total).isEqualByComparingTo("75.00");
    }
}

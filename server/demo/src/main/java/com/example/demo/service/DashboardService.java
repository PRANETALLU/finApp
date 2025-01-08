package com.example.demo.service;

import com.example.demo.dto.DashboardSummaryDTO;
import com.example.demo.model.Transaction;
import com.example.demo.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardSummaryDTO getDashboardSummary(Long userId) {
       
        List<Transaction> transactions = transactionRepository.findRecentTransactionsByUserId(userId, PageRequest.of(0, 5)).getContent();

        BigDecimal totalIncome = transactionRepository.getTotalAmountByType(userId, "INCOME");
        BigDecimal totalExpense = transactionRepository.getTotalAmountByType(userId, "EXPENSE");


        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        return new DashboardSummaryDTO(totalIncome, totalExpense, netSavings, transactions);
    }
}

package com.example.demo.repository;

import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    private Transaction createTransaction(User user, String type, BigDecimal amount, String category) {
        return new Transaction(
                user,
                amount,
                category,
                "Test description",
                type,
                LocalDateTime.now(),
                "completed",
                "credit card"
        );
    }

    @Test
    void testFindRecentTransactionsByUserId() {
        User user = new User();
        user.setUsername("user1");
        user = userRepository.save(user);

        Transaction tx1 = createTransaction(user, "EXPENSE", new BigDecimal("50.00"), "Food");
        Transaction tx2 = createTransaction(user, "INCOME", new BigDecimal("200.00"), "Salary");

        transactionRepository.save(tx1);
        transactionRepository.save(tx2);

        List<Transaction> transactions = transactionRepository.findRecentTransactionsByUserId(user.getId(), PageRequest.of(0, 2)).getContent();

        assertThat(transactions).hasSize(2);
        assertThat(transactions.get(0).getAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void testGetTotalAmountByType() {
        User user = new User();
        user.setUsername("user2");
        user = userRepository.save(user);

        transactionRepository.save(createTransaction(user, "EXPENSE", new BigDecimal("100.00"), "Food"));
        transactionRepository.save(createTransaction(user, "EXPENSE", new BigDecimal("50.00"), "Transport"));

        BigDecimal total = transactionRepository.getTotalAmountByType(user.getId(), "EXPENSE");

        assertThat(total).isEqualByComparingTo("150.00");
    }

    @Test
    void testGetTotalAmountByTypeAndDateRange() {
        User user = new User();
        user.setUsername("user3");
        user = userRepository.save(user);

        LocalDateTime now = LocalDateTime.now();

        transactionRepository.save(createTransaction(user, "EXPENSE", new BigDecimal("100.00"), "Groceries"));

        BigDecimal total = transactionRepository.getTotalAmountByTypeAndDateRange(user.getId(), "EXPENSE",
                now.minusDays(1), now.plusDays(1));

        assertThat(total).isEqualByComparingTo("100.00");
    }

    @Test
    void testGetTotalExpensesByCategory() {
        User user = new User();
        user.setUsername("user4");
        user = userRepository.save(user);

        transactionRepository.save(createTransaction(user, "EXPENSE", new BigDecimal("80.00"), "Entertainment"));
        transactionRepository.save(createTransaction(user, "EXPENSE", new BigDecimal("20.00"), "Entertainment"));

        BigDecimal total = transactionRepository.getTotalExpensesByCategory(user.getId(), "Entertainment");

        assertThat(total).isEqualByComparingTo("100.00");
    }
}

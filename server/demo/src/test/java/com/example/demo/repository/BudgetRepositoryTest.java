package com.example.demo.repository;

import com.example.demo.model.Budget;
import com.example.demo.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class BudgetRepositoryTest {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByUserId() {
        User user = new User();
        user.setUsername("testUser");
        user = userRepository.save(user);

        Budget budget = new Budget(
                user,
                "Groceries",
                new BigDecimal("500.00"),
                "Monthly grocery budget",
                "monthly",
                LocalDateTime.now().withDayOfMonth(1),
                LocalDateTime.now().withDayOfMonth(30)
        );
        budgetRepository.save(budget);

        List<Budget> budgets = budgetRepository.findByUserId(user.getId());

        assertThat(budgets).hasSize(1);
        assertThat(budgets.get(0).getCategory()).isEqualTo("Groceries");
        assertThat(budgets.get(0).getAmount()).isEqualByComparingTo("500.00");
        assertThat(budgets.get(0).getRemainingAmount()).isEqualByComparingTo("500.00");
    }
}

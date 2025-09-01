package com.example.demo.repository;

import com.example.demo.model.Goal;
import com.example.demo.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class GoalRepositoryTest {

    @Autowired
    private GoalRepository goalRepository;

    @Test
    void testFindByUserId() {
        User user = new User();
        user.setId(1L);

        Goal goal = new Goal(user, "Vacation Fund", BigDecimal.valueOf(2000));
        goalRepository.save(goal);

        List<Goal> goals = goalRepository.findByUserId(1L);
        assertEquals(1, goals.size());
        assertEquals("Vacation Fund", goals.get(0).getName());
    }
}

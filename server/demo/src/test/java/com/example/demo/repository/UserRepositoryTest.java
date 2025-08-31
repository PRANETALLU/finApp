package com.example.demo.repository;

import com.example.demo.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByUsername() {
        User user = new User();
        user.setUsername("john123");
        user.setPassword("secret");
        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByUsername("john123");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("john123");
    }

    @Test
    void testFindByUsernameNotFound() {
        Optional<User> foundUser = userRepository.findByUsername("ghost");
        assertThat(foundUser).isNotPresent();
    }
}

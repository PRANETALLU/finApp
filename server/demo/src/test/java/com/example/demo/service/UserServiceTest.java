package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser_Success() {
        User user = new User();
        user.setUsername("newUser");
        when(userRepository.findByUsername("newUser")).thenReturn(Optional.empty());
        when(userRepository.save(user)).thenReturn(user);

        User savedUser = userService.registerUser(user);

        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("newUser");
    }

    @Test
    void testRegisterUser_UsernameExists() {
        User user = new User();
        user.setUsername("existingUser");
        when(userRepository.findByUsername("existingUser")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.registerUser(user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username already exists");
    }

    @Test
    void testFindByUsername_UserFound() {
        User user = new User();
        user.setUsername("john");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        User foundUser = userService.findByUsername("john");

        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getUsername()).isEqualTo("john");
    }

    @Test
    void testFindByUsername_UserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findByUsername("ghost"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void testGetAllUsers() {
        User u1 = new User(); u1.setUsername("a");
        User u2 = new User(); u2.setUsername("b");

        when(userRepository.findAll()).thenReturn(Arrays.asList(u1, u2));

        assertThat(userService.getAllUsers()).hasSize(2);
    }
}

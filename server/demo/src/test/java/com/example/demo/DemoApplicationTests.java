package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.controller.AuthController;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtUtil;

@SpringBootTest
class DemoApplicationTests {

    @Autowired
    private UserRepository userRepository;

     @InjectMocks
    private AuthController authController;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;


    @Test
    void testFindAll() {
        List<User> users = userRepository.findAll();
        Assertions.assertNotNull(users);
    }

    @Test
    void testRegisterUser_Success() {
        // Arrange
        User newUser = new User();
        newUser.setUsername("testuser");
        newUser.setEmail("testuser@example.com");
        newUser.setPassword("password123");

        // Act
        User registeredUser = userService.registerUser(newUser);

        // Assert
        assertNotNull(registeredUser);
        assertEquals("testuser", registeredUser.getUsername());
        assertEquals("testuser@example.com", registeredUser.getEmail());
        // verify(userRepository, times(1)).findByUsername("testuser");
        // verify(userRepository, times(1)).save(newUser);
    }

    @Test
    void testLogin_Success() {
        // Arrange
        String username = "FDSFSDFDS";
        String password = "password123";
        String generatedToken = "mockToken";

        User mockUser = new User();
        mockUser.setUsername(username);
        mockUser.setPassword(password);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        if(userService.findByUsername(username) != null) {
            System.out.println("User is found"); 
        }
        else {
            System.out.println("User is NOT found"); 
        }

        when(userService.findByUsername(username)).thenReturn(mockUser);
        when(jwtUtil.generateToken(username)).thenReturn(generatedToken);

        // Act
        ResponseEntity<?> response = authController.login(loginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(generatedToken, response.getBody());
    }


}

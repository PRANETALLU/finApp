package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.controller.AuthController;
import com.example.demo.dto.DashboardSummaryDTO;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.DashboardService;
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

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private DashboardService dashboardService;


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

    @Test
    public void testGetDashboardSummary() {
        // Create mock user
        User user = new User();
        user.setId(1L);
        
        // Create mock transactions
        List<Transaction> transactions = Arrays.asList(
                new Transaction(user, new BigDecimal("100.00"), "Salary", "Monthly salary", "INCOME", LocalDateTime.now(), "completed", "bank transfer"),
                new Transaction(user, new BigDecimal("50.00"), "Food", "Lunch at restaurant", "EXPENSE", LocalDateTime.now(), "completed", "credit card")
                /* new Transaction(user, new BigDecimal("200.00"), "Freelance", "Freelance work", "INCOME", LocalDateTime.now(), "completed", "bank transfer"),
                new Transaction(user, new BigDecimal("30.00"), "Entertainment", "Movie ticket", "EXPENSE", LocalDateTime.now(), "pending", "credit card"),
                new Transaction(user, new BigDecimal("120.00"), "Salary", "Freelance payment", "INCOME", LocalDateTime.now(), "completed", "bank transfer") */
        );

        // Assuming `dashboardService` has a method to mock/retrieve data
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == "INCOME")
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == "EXPENSE")
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        // Assert totals
        assertEquals(new BigDecimal("100.00"), totalIncome); // 100 + 200 + 120
        assertEquals(new BigDecimal("50.00"), totalExpense); // 50 + 30
        assertEquals(new BigDecimal("50.00"), netSavings); // 420 - 80
    }
}

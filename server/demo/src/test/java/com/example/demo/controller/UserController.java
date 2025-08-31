package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void testGetUserInfo() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setAge(25);
        when(userService.findByUsername("john")).thenReturn(user);

        mockMvc.perform(get("/api/user/john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.age").value(25));
    }

    @Test
    void testEditUserInfo() throws Exception {
        User existing = new User();
        existing.setUsername("john");
        existing.setAge(25);

        User updated = new User();
        updated.setUsername("john");
        updated.setAge(30);

        when(userService.findByUsername("john")).thenReturn(existing);

        mockMvc.perform(put("/api/user/edit/john")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"age\":30,\"incomeAllow\":5000,\"role\":\"ADMIN\",\"setAmount\":1000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(30));
    }

    @Test
    void testGetAllUsers() throws Exception {
        User u1 = new User(); u1.setUsername("a");
        User u2 = new User(); u2.setUsername("b");

        when(userService.getAllUsers()).thenReturn(Arrays.asList(u1, u2));

        mockMvc.perform(get("/api/user/allUsers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}

package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtUtil;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for user: " + loginRequest.getUsername());
        User foundUser = userService.findByUsername(loginRequest.getUsername());
        if (foundUser == null || !foundUser.getPassword().equals(loginRequest.getPassword())) {
            System.out.println("Invalid credentials for user: " + loginRequest.getUsername());
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(loginRequest.getUsername());

        Map<String, String> store = new HashMap<>(); 
        store.put("token", token); 
        //store.put("id", foundUser.getId());
        store.put("username", foundUser.getUsername());
        store.put("email", foundUser.getEmail()); 
        return ResponseEntity.status(HttpStatus.OK).body(store);
    }

}

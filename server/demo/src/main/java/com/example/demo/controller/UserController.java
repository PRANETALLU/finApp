package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;



@RestController 
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserInfo(@PathVariable String username) {
        User foundUser = userService.findByUsername(username);
        
        if (foundUser == null) {
            return ResponseEntity.status(401).body("Cannot find user");
        }
        
        return ResponseEntity.status(200).body(foundUser);
    }

    @PutMapping("/edit/{username}")
    public ResponseEntity<?> editUserInfo(@PathVariable String username, @RequestBody User user) {
        User foundUser = userService.findByUsername(username);
        
        if (foundUser == null) {
            return ResponseEntity.status(401).body("Cannot find user");
        }

        foundUser.setAge(user.getAge());
        foundUser.setIncomeAllow(user.getIncomeAllow());
        foundUser.setRole(user.getRole());
        foundUser.setSetAmount(user.getSetAmount());

        userService.saveUser(foundUser);
        
        return ResponseEntity.status(200).body(foundUser);
    }

    @GetMapping("/allUsers")
    public ResponseEntity<?> getUserList() {
        List<User> userList = userService.getAllUsers();
        return ResponseEntity.status(200).body(userList); 
    }
    
}

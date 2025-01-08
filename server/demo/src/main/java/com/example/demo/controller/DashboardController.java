package com.example.demo.controller;

import com.example.demo.dto.DashboardSummaryDTO;
import com.example.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{userId}")
    public DashboardSummaryDTO getDashboardSummary(@PathVariable String userId) {
        return dashboardService.getDashboardSummary(Long.parseLong(userId));
    }
}

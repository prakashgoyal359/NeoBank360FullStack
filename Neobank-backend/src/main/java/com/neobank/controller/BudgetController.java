package com.neobank.controller;

import com.neobank.dto.BudgetDTO;
import com.neobank.dto.BudgetRequest;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody BudgetRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BudgetDTO budget = budgetService.createOrUpdateBudget(user.getId(), request);
        return ResponseEntity.ok(budget);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getBudgets(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<BudgetDTO> budgets = budgetService.getBudgetsForUser(user.getId());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/analytics")
    public ResponseEntity<BudgetDTO> getBudgetAnalytics(
            @AuthenticationPrincipal String username,
            @RequestParam String month) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BudgetDTO analytics = budgetService.getBudgetWithSpending(user.getId(), month);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudget(
            @AuthenticationPrincipal String username,
            @PathVariable Long id) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BudgetDTO budget = budgetService.getBudgetById(id, user.getId());
        return ResponseEntity.ok(budget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal String username,
            @PathVariable Long id) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        budgetService.deleteBudget(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
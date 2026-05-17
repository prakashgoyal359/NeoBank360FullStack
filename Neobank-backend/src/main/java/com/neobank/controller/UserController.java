package com.neobank.controller;

import com.neobank.dto.BillDTO;
import com.neobank.dto.BillPaymentRequest;
import com.neobank.dto.BillRequest;
import com.neobank.dto.BudgetDTO;
import com.neobank.dto.BudgetRequest;
import com.neobank.dto.MoneyTransferRequest;
import com.neobank.dto.RewardDTO;
import com.neobank.dto.RewardHistoryDTO;
import com.neobank.security.SecurityUtils;
import com.neobank.service.BillService;
import com.neobank.service.BudgetService;
import com.neobank.service.MoneyTransferService;
import com.neobank.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final MoneyTransferService moneyTransferService;
    private final BillService billService;
    private final BudgetService budgetService;
    private final RewardService rewardService;
    private final SecurityUtils securityUtils;

    @PostMapping("/transfer")
    public ResponseEntity<String> transferMoney(@Valid @RequestBody MoneyTransferRequest request) {
        moneyTransferService.transfer(request, securityUtils.getCurrentUser().getUsername());
        return ResponseEntity.ok("Transfer completed successfully");
    }

    @PostMapping("/bills")
    public ResponseEntity<BillDTO> createBill(@Valid @RequestBody BillRequest request) {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(billService.createBill(userId, request));
    }

    @GetMapping("/bills")
    public ResponseEntity<List<BillDTO>> getBills() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(billService.getBillsForUser(userId));
    }

    @PostMapping("/bills/{billId}/pay")
    public ResponseEntity<BillDTO> payBill(@PathVariable Long billId) {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(billService.payBill(userId, billId));
    }

    @PostMapping("/bills/pay")
    public ResponseEntity<BillDTO> payBill(@Valid @RequestBody BillPaymentRequest request) {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(billService.createAndPayBill(userId, request));
    }

    @PostMapping("/budgets")
    public ResponseEntity<BudgetDTO> createBudget(@Valid @RequestBody BudgetRequest request) {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(userId, request));
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<BudgetDTO>> getBudgets() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(budgetService.getBudgetsForUser(userId));
    }

    @GetMapping("/rewards")
    public ResponseEntity<RewardDTO> getRewards() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(rewardService.getRewardBalance(userId));
    }

    @GetMapping("/rewards/history")
    public ResponseEntity<List<RewardHistoryDTO>> getRewardHistory() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(rewardService.getRewardHistory(userId));
    }
}

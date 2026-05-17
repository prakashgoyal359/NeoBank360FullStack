package com.neobank.controller;

import com.neobank.dto.TransactionDTO;
import com.neobank.entity.Account;
import com.neobank.security.SecurityUtils;
import com.neobank.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<?> getAccounts() {
        var user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(accountService.getAccountsForUser(user.getId()));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDTO>> getAccountTransactions(@PathVariable Long id) {
        var user = securityUtils.getCurrentUser();
        Account account = accountService.getAccountById(id);
        if (!account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(accountService.getTransactionsForAccount(id));
    }
}

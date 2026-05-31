package com.neobank.controller;

import com.neobank.dto.AccountDTO;
import com.neobank.dto.DepositRequest;
import com.neobank.dto.UserDTO;
import com.neobank.security.SecurityUtils;
import com.neobank.service.AccountService;
import com.neobank.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final AccountService accountService;
    private final SecurityUtils securityUtils;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.getUsers(PageRequest.of(page, size), search));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, active, securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PostMapping("/deposit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deposit(@Valid @RequestBody DepositRequest request) {
        var account = accountService.getAccountByNumber(request.getAccountNumber());
        accountService.saveTransaction(account.getId(), com.neobank.dto.TransactionRequest.builder()
                .amount(request.getAmount())
                .description("Admin deposit")
                .transactionType("CREDIT")
                .build(), "CREDIT");
        return ResponseEntity.ok("Deposit successful");
    }

    @PutMapping("/accounts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountDTO> updateAccount(
            @PathVariable Long id,
            @RequestParam(required = false) String accountType,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) java.math.BigDecimal balance,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String email) {
        // Update account fields
        accountService.updateAccount(id, accountType, isActive, balance);
        // Update user fields
        return ResponseEntity.ok(accountService.updateAccountUser(id, userName, email));
    }
}

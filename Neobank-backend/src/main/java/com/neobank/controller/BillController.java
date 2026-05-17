package com.neobank.controller;

import com.neobank.dto.BillDTO;
import com.neobank.dto.BillPaymentRequest;
import com.neobank.dto.BillRequest;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BillDTO> createBill(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody BillRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BillDTO bill = billService.createBill(user.getId(), request);
        return ResponseEntity.ok(bill);
    }

    @GetMapping
    public ResponseEntity<List<BillDTO>> getBills(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<BillDTO> bills = billService.getBillsForUser(user.getId());
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<BillDTO>> getUpcomingBills(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<BillDTO> bills = billService.getUpcomingBills(user.getId());
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BillDTO>> getOverdueBills(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<BillDTO> bills = billService.getOverdueBills(user.getId());
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBill(
            @AuthenticationPrincipal String username,
            @PathVariable Long id) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BillDTO bill = billService.getBillById(id, user.getId());
        return ResponseEntity.ok(bill);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<BillDTO> payBill(
            @AuthenticationPrincipal String username,
            @PathVariable Long id) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BillDTO bill = billService.payBill(user.getId(), id);
        return ResponseEntity.ok(bill);
    }

    @PostMapping("/pay")
    public ResponseEntity<BillDTO> createAndPayBill(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody BillPaymentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BillDTO bill = billService.createAndPayBill(user.getId(), request);
        return ResponseEntity.ok(bill);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BillDTO> updateBillStatus(
            @AuthenticationPrincipal String username,
            @PathVariable Long id,
            @RequestParam String status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BillDTO bill = billService.updateBillStatus(id, user.getId(), status);
        return ResponseEntity.ok(bill);
    }
}
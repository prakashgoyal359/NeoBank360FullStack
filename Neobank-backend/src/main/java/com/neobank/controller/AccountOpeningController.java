package com.neobank.controller;

import com.neobank.dto.AccountOpeningRequest;
import com.neobank.dto.AccountOpeningResponse;
import com.neobank.dto.ApproveAccountRequest;
import com.neobank.service.AccountOpeningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountOpeningController {

    private final AccountOpeningService accountOpeningService;

    private final com.neobank.repository.AccountOpeningFormRepository formRepository;
    private final com.neobank.repository.UserRepository userRepository;

    @PostMapping(value = "/open", consumes = { "multipart/form-data" })
    public ResponseEntity<AccountOpeningResponse> openAccount(
            @RequestPart("data") @Valid AccountOpeningRequest request,
            @RequestPart("aadhaarFile") MultipartFile aadhaarFile,
            @RequestPart("panFile") MultipartFile panFile,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile) {
        return ResponseEntity.ok(accountOpeningService.submitApplication(request, aadhaarFile, panFile, photoFile));
    }

    @GetMapping("/kyc/aadhaar/{aadhaarNumber}/exists")
    public ResponseEntity<java.util.Map<String, Object>> aadhaarExists(@PathVariable String aadhaarNumber) {
        boolean exists = formRepository.findByAadhaarNumber(aadhaarNumber).isPresent()
                || userRepository.findByAadhaarNumber(aadhaarNumber).isPresent();
        return ResponseEntity.ok(java.util.Map.of(
                "exists", exists,
                "message", exists ? "This Aadhaar number user already exists" : "Aadhaar number is available"));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AccountOpeningResponse>> pendingApplications() {
        return ResponseEntity.ok(accountOpeningService.getPendingApplications());
    }

    @GetMapping("/all")
    public ResponseEntity<List<AccountOpeningResponse>> allApplications() {
        return ResponseEntity.ok(accountOpeningService.getAllApplications());
    }

    @PostMapping("/pending/{id}/approve")
    public ResponseEntity<AccountOpeningResponse> approve(@PathVariable Long id, @RequestBody ApproveAccountRequest request) {
        return ResponseEntity.ok(accountOpeningService.approveApplication(id, request));
    }

    @PostMapping("/pending/{id}/reject")
    public ResponseEntity<AccountOpeningResponse> reject(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(accountOpeningService.rejectApplication(id, reason));
    }
}

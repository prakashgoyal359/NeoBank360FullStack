package com.neobank.service.impl;

import com.neobank.dto.AccountOpeningRequest;
import com.neobank.dto.AccountOpeningResponse;
import com.neobank.dto.ApproveAccountRequest;
import com.neobank.entity.*;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.AccountOpeningFormRepository;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.RewardRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.AccountOpeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountOpeningServiceImpl implements AccountOpeningService {

    private final AccountOpeningFormRepository formRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final RewardRepository rewardRepository;

    @Override
    public AccountOpeningResponse submitApplication(AccountOpeningRequest request, MultipartFile aadhaarFile,
            MultipartFile panFile, MultipartFile photoFile) {
        // Check for existing application by email or aadhaar (any status)
        if (formRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("An application already exists for this email");
        }
        if (formRepository.findByAadhaarNumber(request.getAadhaarNumber()).isPresent()) {
            throw new BadRequestException("An application already exists for this Aadhaar number");
        }

        String aadhaarPath = storeFile(aadhaarFile, request.getAadhaarNumber(), "aadhaar");
        String panPath = storeFile(panFile, request.getPanNumber(), "pan");
        String photoPath = storeFile(photoFile, request.getAadhaarNumber(), "photo");

        AccountOpeningForm form = AccountOpeningForm.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .aadhaarNumber(request.getAadhaarNumber())
                .panNumber(request.getPanNumber())
                .address(request.getAddress())
                .accountType(AccountType.valueOf(request.getAccountType().toUpperCase()))
                .gender(request.getGender())
                .aadhaarCardPath(aadhaarPath)
                .panCardPath(panPath)
                .photoPath(photoPath)
                .status(ApplicationStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .dateOfBirth(request.getDateOfBirth())
                .occupation(request.getOccupation())
                .annualIncome(request.getAnnualIncome() != null ? java.math.BigDecimal.valueOf(request.getAnnualIncome()) : null)
                .initialDeposit(request.getInitialDeposit() != null ? java.math.BigDecimal.valueOf(request.getInitialDeposit()) : null)
                .build();

        formRepository.save(form);

        return AccountOpeningResponse.builder()
                .id(form.getId())
                .fullName(form.getFullName())
                .email(form.getEmail())
                .status(form.getStatus().name())
                .submittedAt(form.getSubmittedAt())
                .message("Your request has been submitted successfully. Bank verification may take 5-7 working days.")
                .build();
    }

    @Override
    public List<AccountOpeningResponse> getPendingApplications() {
        return formRepository.findByStatus(ApplicationStatus.PENDING).stream()
                .map(form -> AccountOpeningResponse.builder()
                        .id(form.getId())
                        .fullName(form.getFullName())
                        .email(form.getEmail())
                        .mobileNumber(form.getMobileNumber())
                        .aadhaarNumber(form.getAadhaarNumber())
                        .panNumber(form.getPanNumber())
                        .address(form.getAddress())
                        .accountType(form.getAccountType().name())
                        .gender(form.getGender())
                        .status(form.getStatus().name())
                        .submittedAt(form.getSubmittedAt())
                        .aadhaarCardPath(form.getAadhaarCardPath())
                        .panCardPath(form.getPanCardPath())
                        .photoPath(form.getPhotoPath())
                        .dateOfBirth(form.getDateOfBirth())
                        .occupation(form.getOccupation())
                        .annualIncome(form.getAnnualIncome())
                        .initialDeposit(form.getInitialDeposit())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountOpeningResponse> getAllApplications() {
        return formRepository.findAll().stream()
                .map(form -> AccountOpeningResponse.builder()
                        .id(form.getId())
                        .fullName(form.getFullName())
                        .email(form.getEmail())
                        .mobileNumber(form.getMobileNumber())
                        .aadhaarNumber(form.getAadhaarNumber())
                        .panNumber(form.getPanNumber())
                        .address(form.getAddress())
                        .accountType(form.getAccountType().name())
                        .gender(form.getGender())
                        .status(form.getStatus().name())
                        .submittedAt(form.getSubmittedAt())
                        .aadhaarCardPath(form.getAadhaarCardPath())
                        .panCardPath(form.getPanCardPath())
                        .photoPath(form.getPhotoPath())
                        .dateOfBirth(form.getDateOfBirth())
                        .occupation(form.getOccupation())
                        .annualIncome(form.getAnnualIncome())
                        .initialDeposit(form.getInitialDeposit())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccountOpeningResponse approveApplication(Long applicationId, ApproveAccountRequest request) {
        AccountOpeningForm form = formRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!ApplicationStatus.PENDING.equals(form.getStatus())) {
            throw new BadRequestException("Only pending applications can be approved");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadRequestException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(request.getPassword()))
                .email(form.getEmail())
                .fullName(form.getFullName())
                .mobileNumber(form.getMobileNumber())
                .aadhaarNumber(form.getAadhaarNumber())
                .panNumber(form.getPanNumber())
                .address(form.getAddress())
                .gender(form.getGender())
                .role(UserRole.USER)
                .isActive(true)
                .isApproved(true)
                .build();

        userRepository.save(user);

        Account account = Account.builder()
                .user(user)
                .accountNumber(generateAccountNumber())
                .accountType(form.getAccountType())
                .balance(java.math.BigDecimal.ZERO)
                .isActive(true)
                .build();

        accountRepository.save(account);

        rewardRepository.save(Reward.builder().user(user).pointsBalance(100L).lastUpdated(LocalDateTime.now()).build());

        form.setStatus(ApplicationStatus.APPROVED);
        formRepository.save(form);

        return AccountOpeningResponse.builder()
                .id(form.getId())
                .fullName(form.getFullName())
                .email(form.getEmail())
                .status(form.getStatus().name())
                .submittedAt(form.getSubmittedAt())
                .message("Application approved. Username: " + request.getUsername() + " Password: " + request.getPassword())
                .build();
    }

    @Override
    public AccountOpeningResponse rejectApplication(Long applicationId, String reason) {
        AccountOpeningForm form = formRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        form.setStatus(ApplicationStatus.REJECTED);
        form.setRejectionReason(reason);
        formRepository.save(form);
        return AccountOpeningResponse.builder()
                .id(form.getId())
                .fullName(form.getFullName())
                .email(form.getEmail())
                .status(form.getStatus().name())
                .submittedAt(form.getSubmittedAt())
                .message("Application rejected: " + reason)
                .build();
    }

    private String storeFile(MultipartFile file, String identifier, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File upload is required");
        }
        try {
            // Create uploads directory in the application working directory
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "documents");
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : ".pdf";
            String fileName = prefix + "_" + identifier + "_" + UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(fileName);
            file.transferTo(target.toFile());
            return target.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    private String generateUsername(String fullName) {
        String normalized = fullName.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        int suffix = (int) (Math.random() * 9000) + 1000;
        return normalized + suffix;
    }

    private String generatePassword(String fullName) {
        String normalized = fullName.trim().replaceAll("[^A-Za-z]", "");
        if (normalized.length() > 6) {
            normalized = normalized.substring(0, 6);
        }
        int digits = (int) (Math.random() * 9000) + 1000;
        String symbols = "!@";
        return normalized + digits + symbols;
    }

    private String generateAccountNumber() {
        return "NB" + (int) (Math.random() * 90000000) + 10000000;
    }
}

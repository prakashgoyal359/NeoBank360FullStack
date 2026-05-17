package com.neobank.service.impl;

import com.neobank.dto.BillDTO;
import com.neobank.dto.BillPaymentRequest;
import com.neobank.dto.BillRequest;
import com.neobank.entity.Bill;
import com.neobank.entity.BillStatus;
import com.neobank.entity.*;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.*;
import com.neobank.service.BillService;
import com.neobank.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final RewardService rewardService;

    @Override
    public BillDTO createBill(Long userId, BillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find user's primary account
        Account account = accountRepository.findByUser(user).stream().findFirst()
                .orElse(null);

        Bill bill = Bill.builder()
                .user(user)
                .account(account)
                .billerName(request.getBillerName())
                .billerAccountNumber("BILL-" + System.currentTimeMillis())
                .category(request.getCategory())
                .billType(request.getCategory())
                .amount(request.getAmount())
                .dueDate(LocalDate.parse(request.getDueDate()))
                .status(BillStatus.PENDING)
                .description(request.getDescription())
                .build();
        billRepository.save(bill);
        return mapBill(bill);
    }

    @Override
    public List<BillDTO> getBillsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return billRepository.findByUser(user).stream().map(this::mapBill).collect(Collectors.toList());
    }

    @Override
    public List<BillDTO> getUpcomingBills(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate threeDaysFromNow = LocalDate.now().plusDays(3);
        return billRepository.findByUserAndStatus(user, BillStatus.PENDING).stream()
                .filter(bill -> !bill.getDueDate().isAfter(threeDaysFromNow))
                .map(this::mapBill)
                .collect(Collectors.toList());
    }

    @Override
    public List<BillDTO> getOverdueBills(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate today = LocalDate.now();
        return billRepository.findByUserAndStatus(user, BillStatus.PENDING).stream()
                .filter(bill -> bill.getDueDate().isBefore(today))
                .map(this::mapBill)
                .collect(Collectors.toList());
    }

    @Override
    public BillDTO getBillById(Long billId, Long userId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bill does not belong to user");
        }
        return mapBill(bill);
    }

    @Override
    @Transactional
    public BillDTO payBill(Long userId, Long billId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bill does not belong to user");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BadRequestException("Bill has already been paid");
        }

        var account = accountRepository.findByUser(user).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getBalance().compareTo(bill.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance to pay bill");
        }

        account.setBalance(account.getBalance().subtract(bill.getAmount()));
        accountRepository.save(account);

        transactionRepository.save(Transaction.builder()
                .account(account)
                .transactionType(TransactionType.DEBIT)
                .amount(bill.getAmount())
                .description("Bill payment: " + bill.getBillerName())
                .category(bill.getCategory())
                .balanceAfter(account.getBalance())
                .referenceNumber("BILL" + System.currentTimeMillis())
                .build());

        bill.setAccount(account);
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(java.time.LocalDateTime.now());
        billRepository.save(bill);

        // Add reward points for bill payment
        try {
            rewardService.addRewardPoints(userId, 10L, "Bill payment reward: " + bill.getBillerName());
        } catch (Exception e) {
            // Log but don't fail the payment if reward fails
            org.slf4j.LoggerFactory.getLogger(BillServiceImpl.class)
                    .warn("Failed to add reward points for bill payment: " + e.getMessage());
        }

        return mapBill(bill);
    }

    @Override
    @Transactional
    public BillDTO createAndPayBill(Long userId, BillPaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Account does not belong to user");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance to pay bill");
        }

        // Deduct from account
        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        // Create transaction
        transactionRepository.save(Transaction.builder()
                .account(account)
                .transactionType(TransactionType.DEBIT)
                .amount(request.getAmount())
                .description("Bill payment: " + request.getBillerName())
                .category(request.getBillType() != null ? request.getBillType() : "Bill Payment")
                .balanceAfter(account.getBalance())
                .referenceNumber("BILL" + System.currentTimeMillis())
                .build());

        // Create bill (already paid)
        Bill bill = Bill.builder()
                .user(user)
                .account(account)
                .billerName(request.getBillerName())
                .billerAccountNumber(request.getBillerAccountNumber())
                .category("Bill Payment")
                .billType(request.getBillType())
                .amount(request.getAmount())
                .dueDate(LocalDate.now())
                .status(BillStatus.PAID)
                .paidAt(java.time.LocalDateTime.now())
                .description("Bill payment to " + request.getBillerName())
                .build();
        billRepository.save(bill);

        // Add reward points for bill payment
        try {
            rewardService.addRewardPoints(userId, 10L, "Bill payment reward: " + request.getBillerName());
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(BillServiceImpl.class)
                    .warn("Failed to add reward points for bill payment: " + e.getMessage());
        }

        return mapBill(bill);
    }

    @Override
    @Transactional
    public BillDTO updateBillStatus(Long billId, Long userId, String status) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bill does not belong to user");
        }

        BillStatus newStatus;
        try {
            newStatus = BillStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        bill.setStatus(newStatus);
        if (newStatus == BillStatus.PAID) {
            bill.setPaidAt(java.time.LocalDateTime.now());
        }
        billRepository.save(bill);
        return mapBill(bill);
    }

    private BillDTO mapBill(Bill bill) {
        boolean remindMe = bill.getStatus() == BillStatus.PENDING &&
                !bill.getDueDate().isAfter(LocalDate.now().plusDays(3));

        return BillDTO.builder()
                .id(bill.getId())
                .billerName(bill.getBillerName())
                .billerAccountNumber(bill.getBillerAccountNumber())
                .billType(bill.getBillType())
                .category(bill.getCategory())
                .amount(bill.getAmount())
                .dueDate(bill.getDueDate().toString())
                .status(bill.getStatus().name())
                .description(bill.getDescription())
                .remindMe(remindMe)
                .createdAt(bill.getCreatedAt() != null ? bill.getCreatedAt().toString() : null)
                .paidAt(bill.getPaidAt() != null ? bill.getPaidAt().toString() : null)
                .build();
    }
}

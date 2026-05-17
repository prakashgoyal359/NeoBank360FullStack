package com.neobank.service.impl;

import com.neobank.dto.MoneyTransferRequest;
import com.neobank.entity.Account;
import com.neobank.entity.MoneyTransfer;
import com.neobank.entity.Transaction;
import com.neobank.entity.TransactionType;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.MoneyTransferRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.MoneyTransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class MoneyTransferServiceImpl implements MoneyTransferService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final MoneyTransferRepository transferRepository;

    @Override
    @Transactional
    public void transfer(MoneyTransferRequest request, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        Account senderAccount = accountRepository.findByUser(sender).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        Account receiverAccount = accountRepository.findByAccountNumber(request.getReceiverAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

        BigDecimal amount = request.getAmount();
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Cannot transfer more than available balance");
        }

        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        receiverAccount.setBalance(receiverAccount.getBalance().add(amount));
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        Transaction debitTransaction = Transaction.builder()
                .account(senderAccount)
                .transactionType(TransactionType.DEBIT)
                .amount(amount)
                .description(request.getDescription())
                .category("TRANSFER")
                .balanceAfter(senderAccount.getBalance())
                .referenceNumber("TRF" + System.currentTimeMillis())
                .build();
        transactionRepository.save(debitTransaction);

        Transaction creditTransaction = Transaction.builder()
                .account(receiverAccount)
                .transactionType(TransactionType.CREDIT)
                .amount(amount)
                .description("Received from " + sender.getFullName())
                .category("TRANSFER")
                .balanceAfter(receiverAccount.getBalance())
                .referenceNumber("TRF" + System.currentTimeMillis() + "R")
                .build();
        transactionRepository.save(creditTransaction);

        transferRepository.save(MoneyTransfer.builder()
                .sender(sender)
                .fromAccount(senderAccount)
                .receiverAccount(receiverAccount)
                .toAccountNumber(receiverAccount.getAccountNumber())
                .amount(amount)
                .description(request.getDescription())
                .status(com.neobank.entity.TransferStatus.COMPLETED)
                .build());
    }
}

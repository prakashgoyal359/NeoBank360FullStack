package com.neobank.service.impl;

import com.neobank.dto.AccountDTO;
import com.neobank.dto.TransactionDTO;
import com.neobank.dto.TransactionRequest;
import com.neobank.entity.Account;
import com.neobank.entity.Transaction;
import com.neobank.entity.TransactionType;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public AccountDTO createAccountForUser(Long userId, String accountType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = Account.builder()
                .user(user)
                .accountNumber(generateAccountNumber())
                .accountType(com.neobank.entity.AccountType.valueOf(accountType.toUpperCase()))
                .balance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        accountRepository.save(account);
        return map(account);
    }

    @Override
    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public List<AccountDTO> getAccountsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return accountRepository.findByUser(user).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAll().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public Page<TransactionDTO> getTransactionHistory(Long accountId, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return transactionRepository.findByAccountOrderByTransactionDateDesc(account, pageable)
                .map(this::mapTransaction);
    }

    @Override
    public List<TransactionDTO> getTransactionsForAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return transactionRepository.findByAccountOrderByTransactionDateDesc(account)
                .stream()
                .map(this::mapTransaction)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionDTO saveTransaction(Long accountId, TransactionRequest request, String transactionType) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        BigDecimal amount = request.getAmount();
        if (TransactionType.valueOf(transactionType.toUpperCase()) == TransactionType.DEBIT
                && account.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        BigDecimal newBalance = account.getBalance();
        if (TransactionType.valueOf(transactionType.toUpperCase()) == TransactionType.CREDIT) {
            newBalance = newBalance.add(amount);
        } else {
            newBalance = newBalance.subtract(amount);
        }

        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .account(account)
                .transactionType(TransactionType.valueOf(transactionType.toUpperCase()))
                .amount(amount)
                .description(request.getDescription())
                .category(request.getCategory())
                .balanceAfter(newBalance)
                .referenceNumber("TXN" + System.currentTimeMillis())
                .build();

        transactionRepository.save(transaction);
        return mapTransaction(transaction);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public AccountDTO updateAccount(Long accountId, String accountType, Boolean isActive, BigDecimal balance) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        System.out.println("Updating account " + accountId + " - accountType: " + accountType + ", isActive: " + isActive + ", balance: " + balance);

        if (accountType != null && !accountType.isEmpty()) {
            account.setAccountType(com.neobank.entity.AccountType.valueOf(accountType.toUpperCase()));
            System.out.println("Set accountType to: " + accountType);
        }

        if (isActive != null) {
            account.setIsActive(isActive);
            System.out.println("Set isActive to: " + isActive);
        }

        if (balance != null) {
            account.setBalance(balance);
            System.out.println("Set balance to: " + balance);
        }

        Account saved = accountRepository.save(account);
        System.out.println("Saved account: " + saved.getIsActive() + ", " + saved.getAccountType() + ", " + saved.getBalance());
        return map(account);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public AccountDTO updateAccountUser(Long accountId, String userName, String email) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        User user = account.getUser();
        if (user != null) {
            if (userName != null && !userName.isEmpty()) {
                user.setUsername(userName);
                System.out.println("Set userName to: " + userName);
            }
            if (email != null && !email.isEmpty()) {
                user.setEmail(email);
                System.out.println("Set email to: " + email);
            }
            userRepository.save(user);
        }

        return map(account);
    }

    private AccountDTO map(Account account) {
        return AccountDTO.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .isActive(account.getIsActive())
                .userName(account.getUser() != null ? account.getUser().getUsername() : null)
                .email(account.getUser() != null ? account.getUser().getEmail() : null)
                .build();
    }

    private TransactionDTO mapTransaction(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .transactionType(transaction.getTransactionType().name())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .category(transaction.getCategory())
                .balanceAfter(transaction.getBalanceAfter())
                .transactionDate(transaction.getTransactionDate())
                .build();
    }

    private String generateAccountNumber() {
        return "NB" + (int) (Math.random() * 90000000) + 10000000;
    }
}

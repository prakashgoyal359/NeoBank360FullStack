package com.neobank.service;

import com.neobank.dto.AccountDTO;
import com.neobank.dto.TransactionDTO;
import com.neobank.dto.TransactionRequest;
import com.neobank.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccountService {
    AccountDTO createAccountForUser(Long userId, String accountType);

    Account getAccountByNumber(String accountNumber);

    Account getAccountById(Long accountId);

    List<AccountDTO> getAccountsForUser(Long userId);

    List<AccountDTO> getAllAccounts();

    Page<TransactionDTO> getTransactionHistory(Long accountId, Pageable pageable);

    List<TransactionDTO> getTransactionsForAccount(Long accountId);

    TransactionDTO saveTransaction(Long accountId, TransactionRequest request, String transactionType);

    AccountDTO updateAccount(Long accountId, String accountType, Boolean isActive, java.math.BigDecimal balance);

    AccountDTO updateAccountUser(Long accountId, String userName, String email);
}

package com.neobank.service.impl;

import com.neobank.dto.TransactionDTO;
import com.neobank.dto.TransactionRequest;
import com.neobank.entity.Account;
import com.neobank.entity.AccountType;
import com.neobank.entity.Transaction;
import com.neobank.entity.TransactionType;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountServiceImplTest {

    @Test
    void saveTransactionCreditsAccountAndPersistsTransaction() {
        AccountRepository accountRepository = mock(AccountRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        Account account = Account.builder()
                .id(1L)
                .accountNumber("NB100")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000"))
                .user(User.builder().username("user").email("user@test.com").build())
                .isActive(true)
                .build();
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        AccountServiceImpl service = new AccountServiceImpl(accountRepository, mock(UserRepository.class),
                transactionRepository);

        TransactionDTO dto = service.saveTransaction(1L, TransactionRequest.builder()
                .amount(new BigDecimal("500"))
                .description("Admin deposit")
                .category("Other")
                .build(), "CREDIT");

        assertEquals(new BigDecimal("1500"), account.getBalance());
        assertEquals(new BigDecimal("1500"), dto.getBalanceAfter());
        verify(accountRepository).save(account);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void saveTransactionRejectsDebitWhenBalanceIsInsufficient() {
        AccountRepository accountRepository = mock(AccountRepository.class);
        Account account = Account.builder()
                .id(1L)
                .balance(new BigDecimal("100"))
                .build();
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        AccountServiceImpl service = new AccountServiceImpl(accountRepository, mock(UserRepository.class),
                mock(TransactionRepository.class));

        assertThrows(BadRequestException.class, () -> service.saveTransaction(1L, TransactionRequest.builder()
                .amount(new BigDecimal("250"))
                .description("Debit")
                .category("Other")
                .build(), "DEBIT"));
    }

    @Test
    void updateAccountChangesStatusTypeAndBalance() {
        AccountRepository accountRepository = mock(AccountRepository.class);
        Account account = Account.builder()
                .id(1L)
                .accountNumber("NB100")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("100"))
                .user(User.builder().username("user").email("user@test.com").build())
                .isActive(true)
                .build();
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(account)).thenReturn(account);
        AccountServiceImpl service = new AccountServiceImpl(accountRepository, mock(UserRepository.class),
                mock(TransactionRepository.class));

        service.updateAccount(1L, "CURRENT", false, new BigDecimal("999"));

        assertEquals(AccountType.CURRENT, account.getAccountType());
        assertEquals(false, account.getIsActive());
        assertEquals(new BigDecimal("999"), account.getBalance());
    }
}

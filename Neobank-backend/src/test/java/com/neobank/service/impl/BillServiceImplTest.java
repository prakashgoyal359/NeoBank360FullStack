package com.neobank.service.impl;

import com.neobank.dto.BillDTO;
import com.neobank.dto.BillPaymentRequest;
import com.neobank.entity.Account;
import com.neobank.entity.AccountType;
import com.neobank.entity.Bill;
import com.neobank.entity.BillStatus;
import com.neobank.entity.Transaction;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.BillRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.NotificationService;
import com.neobank.service.RewardService;
import com.neobank.util.PaymentCategoryUtil;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BillServiceImplTest {

    @Test
    void createAndPayBillDebitsAccountCreatesTransactionAndRewardNotification() {
        UserRepository userRepository = mock(UserRepository.class);
        BillRepository billRepository = mock(BillRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        AccountRepository accountRepository = mock(AccountRepository.class);
        RewardService rewardService = mock(RewardService.class);
        NotificationService notificationService = mock(NotificationService.class);
        User user = User.builder().id(1L).username("user").build();
        Account account = Account.builder()
                .id(10L)
                .user(user)
                .accountNumber("NB10")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000"))
                .isActive(true)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        BillServiceImpl service = new BillServiceImpl(userRepository, billRepository, transactionRepository,
                accountRepository, rewardService, notificationService);

        BillDTO dto = service.createAndPayBill(1L, BillPaymentRequest.builder()
                .accountId(10L)
                .billerName("Metro")
                .billerAccountNumber("MTR-1")
                .amount(new BigDecimal("120"))
                .billType("METRO")
                .build());

        assertEquals(new BigDecimal("880"), account.getBalance());
        assertEquals("PAID", dto.getStatus());
        assertEquals(PaymentCategoryUtil.TRAVEL_PAYMENT, dto.getCategory());
        verify(transactionRepository).save(any(Transaction.class));
        verify(billRepository).save(any(Bill.class));
        verify(rewardService).addRewardPoints(1L, 10L, "Bill payment reward: Metro");
        verify(notificationService).createNotification(eq(1L), eq("Reward received"), any(String.class));
    }

    @Test
    void payBillRejectsBillOwnedByAnotherUser() {
        User user = User.builder().id(1L).build();
        Bill bill = Bill.builder()
                .id(2L)
                .user(User.builder().id(99L).build())
                .amount(new BigDecimal("100"))
                .dueDate(LocalDate.now())
                .status(BillStatus.PENDING)
                .build();
        UserRepository userRepository = mock(UserRepository.class);
        BillRepository billRepository = mock(BillRepository.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(billRepository.findById(2L)).thenReturn(Optional.of(bill));
        BillServiceImpl service = new BillServiceImpl(userRepository, billRepository, mock(TransactionRepository.class),
                mock(AccountRepository.class), mock(RewardService.class), mock(NotificationService.class));

        assertThrows(BadRequestException.class, () -> service.payBill(1L, 2L));
    }

    @Test
    void updateBillStatusRejectsInvalidStatus() {
        User user = User.builder().id(1L).build();
        Bill bill = Bill.builder()
                .id(2L)
                .user(user)
                .amount(new BigDecimal("100"))
                .dueDate(LocalDate.now())
                .status(BillStatus.PENDING)
                .build();
        BillRepository billRepository = mock(BillRepository.class);
        when(billRepository.findById(2L)).thenReturn(Optional.of(bill));
        BillServiceImpl service = new BillServiceImpl(mock(UserRepository.class), billRepository,
                mock(TransactionRepository.class), mock(AccountRepository.class), mock(RewardService.class),
                mock(NotificationService.class));

        assertThrows(BadRequestException.class, () -> service.updateBillStatus(2L, 1L, "DONE"));
    }
}

package com.neobank.repository;

import com.neobank.entity.Account;
import com.neobank.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccountOrderByTransactionDateDesc(Account account, Pageable pageable);

    List<Transaction> findByAccountOrderByTransactionDateDesc(Account account);
}

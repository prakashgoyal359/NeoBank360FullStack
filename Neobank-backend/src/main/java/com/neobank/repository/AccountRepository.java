package com.neobank.repository;

import com.neobank.entity.Account;
import com.neobank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);

    Optional<Account> findByAccountNumber(String accountNumber);

    Optional<Account> findByUserAndId(User user, Long id);
}

package com.neobank.repository;

import com.neobank.entity.MoneyTransfer;
import com.neobank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoneyTransferRepository extends JpaRepository<MoneyTransfer, Long> {
    List<MoneyTransfer> findBySender(User sender);
}

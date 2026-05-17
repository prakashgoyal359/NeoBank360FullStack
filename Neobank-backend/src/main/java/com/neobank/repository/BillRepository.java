package com.neobank.repository;

import com.neobank.entity.Bill;
import com.neobank.entity.BillStatus;
import com.neobank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUser(User user);

    List<Bill> findByUserAndStatus(User user, BillStatus status);
}

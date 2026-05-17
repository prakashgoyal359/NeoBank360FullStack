package com.neobank.repository;

import com.neobank.entity.Budget;
import com.neobank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);

    Optional<Budget> findByUserAndCategoryAndBudgetMonth(User user, String category, YearMonth budgetMonth);

    List<Budget> findByUserAndBudgetMonth(User user, YearMonth budgetMonth);
}

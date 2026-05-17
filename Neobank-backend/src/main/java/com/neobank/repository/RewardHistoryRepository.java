package com.neobank.repository;

import com.neobank.entity.RewardHistory;
import com.neobank.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardHistoryRepository extends JpaRepository<RewardHistory, Long> {
    List<RewardHistory> findByRewardOrderByEarnedAtDesc(Reward reward);
}

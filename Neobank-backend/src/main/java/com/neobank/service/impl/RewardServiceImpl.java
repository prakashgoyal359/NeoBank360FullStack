package com.neobank.service.impl;

import com.neobank.dto.RewardDTO;
import com.neobank.dto.RewardHistoryDTO;
import com.neobank.entity.Reward;
import com.neobank.entity.RewardHistory;
import com.neobank.entity.User;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.RewardHistoryRepository;
import com.neobank.repository.RewardRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardServiceImpl implements RewardService {

    private final UserRepository userRepository;
    private final RewardRepository rewardRepository;
    private final RewardHistoryRepository rewardHistoryRepository;

    @Override
    public RewardDTO getRewardBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Reward reward = rewardRepository.findByUser(user)
                .orElseGet(() -> rewardRepository.save(Reward.builder().user(user).pointsBalance(0L).lastUpdated(java.time.LocalDateTime.now()).build()));
        return RewardDTO.builder()
                .id(reward.getId())
                .pointsBalance(reward.getPointsBalance())
                .build();
    }

    @Override
    public List<RewardHistoryDTO> getRewardHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Reward reward = rewardRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Reward wallet not found"));
        return rewardHistoryRepository.findByRewardOrderByEarnedAtDesc(reward).stream()
                .map(history -> RewardHistoryDTO.builder()
                        .id(history.getId())
                        .pointsEarned(history.getPointsEarned())
                        .description(history.getDescription())
                        .earnedAt(history.getEarnedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addRewardPoints(Long userId, Long points, String description) {
        if (points == null || points <= 0) {
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Reward reward = rewardRepository.findByUser(user)
                .orElseGet(() -> rewardRepository.save(Reward.builder().user(user).pointsBalance(0L).lastUpdated(java.time.LocalDateTime.now()).build()));
        reward.setPointsBalance(reward.getPointsBalance() + points);
        rewardRepository.save(reward);

        rewardHistoryRepository.save(RewardHistory.builder()
                .reward(reward)
                .pointsEarned(points)
                .description(description)
                .build());
    }
}

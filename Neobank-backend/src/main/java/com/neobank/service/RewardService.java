package com.neobank.service;

import com.neobank.dto.RewardDTO;
import com.neobank.dto.RewardHistoryDTO;

import java.util.List;

public interface RewardService {
    RewardDTO getRewardBalance(Long userId);

    List<RewardHistoryDTO> getRewardHistory(Long userId);

    void addRewardPoints(Long userId, Long points, String description);
}

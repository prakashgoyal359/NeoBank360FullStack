package com.neobank.controller;

import com.neobank.dto.RewardDTO;
import com.neobank.dto.RewardHistoryDTO;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<RewardDTO> getRewardBalance(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        RewardDTO reward = rewardService.getRewardBalance(user.getId());
        return ResponseEntity.ok(reward);
    }

    @GetMapping("/history")
    public ResponseEntity<List<RewardHistoryDTO>> getRewardHistory(
            @AuthenticationPrincipal String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<RewardHistoryDTO> history = rewardService.getRewardHistory(user.getId());
        return ResponseEntity.ok(history);
    }
}
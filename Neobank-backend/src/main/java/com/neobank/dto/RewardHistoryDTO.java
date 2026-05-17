package com.neobank.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardHistoryDTO {
    private Long id;
    private Long pointsEarned;
    private String description;
    private LocalDateTime earnedAt;
}

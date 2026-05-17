package com.neobank.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardDTO {
    private Long id;
    private Long pointsBalance;
}

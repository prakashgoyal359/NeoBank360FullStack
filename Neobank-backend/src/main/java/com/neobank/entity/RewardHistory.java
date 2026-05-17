package com.neobank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @Column(nullable = false)
    private Long pointsEarned;

    @Column(length = 200)
    private String description;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime earnedAt = LocalDateTime.now();
}

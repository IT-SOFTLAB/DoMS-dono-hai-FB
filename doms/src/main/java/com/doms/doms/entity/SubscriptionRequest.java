package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) private User user;
    @Column(nullable = false) private String plan;
    @Column(nullable = false) private int documentCredits;
    @Column(nullable = false) private int amount;
    @Column(nullable = false) private String paymentMethod;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
}

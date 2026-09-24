package com.doms.doms.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @AllArgsConstructor @NoArgsConstructor public class SubscriptionDTO {private Long id;private Long userId;private String userName;private String email;private String plan;private int documentCredits;private int amount;private String paymentMethod;private String status;private LocalDateTime requestedAt;private LocalDateTime reviewedAt;}

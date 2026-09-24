package com.doms.doms.entity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDateTime;
@Entity @Table(name="audit_logs") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="user_id") private User user;
 private Long documentId; private String documentCode; private String documentName;
 @Column(nullable=false,length=30) private String action;
 @Column(length=1000) private String details;
 @Column(nullable=false) private LocalDateTime createdAt;
}

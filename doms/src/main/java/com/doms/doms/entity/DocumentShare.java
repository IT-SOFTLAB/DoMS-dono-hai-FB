package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "document_shares", uniqueConstraints = @UniqueConstraint(columnNames = {"document_id", "shared_to"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentShare {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "document_id") private Document document;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "shared_by") private User sharedBy;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "shared_to") private User sharedTo;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SharePermission permission;
    @Column(name = "shared_at", nullable = false) private LocalDateTime sharedAt;
    @PrePersist void createTimestamp() { if (sharedAt == null) sharedAt = LocalDateTime.now(); }
}

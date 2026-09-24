package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentNote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    @ManyToOne(optional = false) @JoinColumn(name = "document_id")
    private Document document;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;
}

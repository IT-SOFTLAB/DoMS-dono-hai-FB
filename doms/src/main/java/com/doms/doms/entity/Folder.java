package com.doms.doms.entity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDateTime;
@Entity @Table(name="folders") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Folder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=120) private String name;
 @ManyToOne @JoinColumn(name="parent_id") private Folder parent;
 @ManyToOne(optional=false) @JoinColumn(name="owner_id") private User owner;
 @Column(nullable=false) private LocalDateTime createdAt;
}

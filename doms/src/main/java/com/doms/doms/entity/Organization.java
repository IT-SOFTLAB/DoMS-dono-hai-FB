package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="organizations", uniqueConstraints={@UniqueConstraint(name="uk_organizations_slug", columnNames="slug"), @UniqueConstraint(name="uk_organizations_name", columnNames="name")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Organization {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=120) private String name;
 @Column(nullable=false,length=120) private String slug;
 @Builder.Default @Column(nullable=false) private boolean active=true;
 @Builder.Default @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
}

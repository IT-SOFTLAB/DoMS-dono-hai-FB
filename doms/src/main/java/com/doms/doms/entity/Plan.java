package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="plans", uniqueConstraints=@UniqueConstraint(name="uk_plans_slug",columnNames="slug"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Plan {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=80) private String name;
 @Column(nullable=false,length=80) private String slug;
 @Column(nullable=false) private long monthlyUploadLimitBytes;
 @Builder.Default @Column(nullable=false) private boolean active=true;
}

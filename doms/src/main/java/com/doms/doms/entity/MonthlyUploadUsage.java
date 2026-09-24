package com.doms.doms.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name="monthly_upload_usage", uniqueConstraints=@UniqueConstraint(name="uk_usage_user_period",columnNames={"user_id","period_start"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlyUploadUsage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(name="period_start",nullable=false) private LocalDate periodStart;
 @Column(name="period_end",nullable=false) private LocalDate periodEnd;
 @Builder.Default @Column(nullable=false) private long usedBytes=0;
 @Version private long version;
}

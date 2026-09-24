package com.doms.doms.entity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDateTime;
@Entity @Table(name="document_versions",uniqueConstraints=@UniqueConstraint(columnNames={"document_id","version_number"})) @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentVersion {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="document_id") private Document document;
 @Column(name="version_number",nullable=false) private Integer versionNumber;
 @Column(nullable=false) private String filePath;
 @Column(nullable=false) private String fileName;
 private String fileType; private Long fileSize; @Column(length=64) private String contentHash;
 @ManyToOne(optional=false) @JoinColumn(name="created_by") private User createdBy;
 @Column(nullable=false) private LocalDateTime createdAt;
 private String changeNote;
}

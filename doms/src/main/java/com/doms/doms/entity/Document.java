package com.doms.doms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String filePath;

    private String fileType;

    private Long fileSize;

    private String description;

    @Column(unique = true)
    private String documentCode;

    private String category;

    private String department;
    private String documentDate;
    private String tags;
    private String referenceNumber;
    private String documentOwner;
    private String confidentiality;
    private String documentStatus;
    private String fiscalYear;
    private String storageLocation;

    private java.time.LocalDateTime uploadedAt;
    private java.time.LocalDateTime deletedAt;
    @Column(length = 64)
    private String contentHash;
    @Builder.Default
    private Integer currentVersion = 1;

    @ManyToOne
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}

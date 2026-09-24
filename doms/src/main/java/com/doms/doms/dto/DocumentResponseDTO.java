package com.doms.doms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentResponseDTO {

    private Long id;

    private String fileName;

    private String filePath;

    private String fileType;

    private Long fileSize;

    private String description;

    private UserResponseDTO uploadedBy;
    private String documentCode;
    private String category;
    private String department;
    private String documentDate;
    private String tags;
    private java.time.LocalDateTime uploadedAt;
    private String referenceNumber;
    private String documentOwner;
    private String confidentiality;
    private String documentStatus;
    private String fiscalYear;
    private String storageLocation;
    private Long folderId;
    private String folderName;
    private Integer currentVersion;
    private java.time.LocalDateTime deletedAt;
}

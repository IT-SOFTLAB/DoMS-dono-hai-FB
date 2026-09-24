package com.doms.doms.dto;

import lombok.Data;

@Data
public class DocumentRequest {

    private String fileName;
    private String fileType;
    private String filePath;
    private Long fileSize;
    private String category;
    private String description;
    private String department;
    private String documentDate;
    private String tags;
    private String referenceNumber;
    private String documentOwner;
    private String confidentiality;
    private String documentStatus;
    private String fiscalYear;
    private String storageLocation;
    private Long folderId;
}

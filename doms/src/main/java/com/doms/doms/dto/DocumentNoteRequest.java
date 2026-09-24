package com.doms.doms.dto;

import lombok.Data;

@Data
public class DocumentNoteRequest {
    private Long documentId;
    private String description;
}

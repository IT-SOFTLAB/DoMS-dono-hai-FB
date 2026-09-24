package com.doms.doms.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @AllArgsConstructor
public class DocumentNoteResponse {
    private Long id;
    private Long documentId;
    private String documentCode;
    private String fileName;
    private String description;
    private LocalDateTime createdAt;
}

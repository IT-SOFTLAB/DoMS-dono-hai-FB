package com.doms.doms.dto;
import com.doms.doms.entity.SharePermission;
import java.time.LocalDateTime;
public record ShareResponse(Long id, Long documentId, String documentName, String sharedBy, LocalDateTime sharedAt, SharePermission permission) {}

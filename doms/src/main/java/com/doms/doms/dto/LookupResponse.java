package com.doms.doms.dto;
import java.time.LocalDateTime;
public record LookupResponse(Long id, String name, String description, LocalDateTime createdAt) {}

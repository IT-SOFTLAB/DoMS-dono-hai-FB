package com.doms.doms.dto;

import java.time.LocalDateTime;

public record LookupTrashResponse(
        Long id,
        String kind,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime deletedAt
) {}

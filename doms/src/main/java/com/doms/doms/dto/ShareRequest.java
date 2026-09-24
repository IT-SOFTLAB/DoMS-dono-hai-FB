package com.doms.doms.dto;
import com.doms.doms.entity.SharePermission;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;
public record ShareRequest(@NotEmpty Set<Long> userIds, SharePermission permission) {}

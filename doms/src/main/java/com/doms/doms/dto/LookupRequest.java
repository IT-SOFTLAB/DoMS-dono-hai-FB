package com.doms.doms.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record LookupRequest(@NotBlank @Size(max=100) String name, @Size(max=500) String description) {}

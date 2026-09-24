package com.doms.doms.dto;
import jakarta.validation.constraints.*;
public record OrganizationRequest(@NotBlank @Size(min=2,max=120) String name){}

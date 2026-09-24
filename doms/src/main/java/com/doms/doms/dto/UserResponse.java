package com.doms.doms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean enabled;
    private int documentLimit;
    private int documentsUsed;
    private String currentPlan;
    private String contactNumber;
    private String jobTitle;
    private String department;
    private String address;
    private Long orgId;
    private String organizationName;
    private Long planId;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private QuotaResponse quota;
}

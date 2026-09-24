package com.doms.doms.dto;
import java.time.LocalDate;
public record QuotaResponse(String plan,long monthlyLimitBytes,long usedBytes,long remainingBytes,LocalDate periodStart,LocalDate periodEnd){}

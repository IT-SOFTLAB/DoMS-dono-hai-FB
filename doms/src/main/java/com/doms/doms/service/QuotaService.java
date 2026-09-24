package com.doms.doms.service;
import com.doms.doms.dto.QuotaResponse;
import com.doms.doms.entity.*;
import com.doms.doms.exception.QuotaExceededException;
import com.doms.doms.repository.MonthlyUploadUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service @RequiredArgsConstructor
public class QuotaService {
 private final MonthlyUploadUsageRepository usage;
 public QuotaResponse current(User user){Period p=period(user,LocalDate.now());long used=usage.findByUserAndPeriodStart(user,p.start).map(MonthlyUploadUsage::getUsedBytes).orElse(0L);long limit=user.getPlan().getMonthlyUploadLimitBytes();return new QuotaResponse(user.getPlan().getName(),limit,used,Math.max(0,limit-used),p.start,p.end);}
 public MonthlyUploadUsage reserve(User user,long bytes){Period p=period(user,LocalDate.now());MonthlyUploadUsage row=usage.findForUpdate(user,p.start).orElseGet(()->usage.saveAndFlush(MonthlyUploadUsage.builder().user(user).periodStart(p.start).periodEnd(p.end).build()));row=usage.findForUpdate(user,p.start).orElse(row);long limit=user.getPlan().getMonthlyUploadLimitBytes();if(bytes<1)throw new IllegalArgumentException("File is empty");if(row.getUsedBytes()>limit-bytes)throw new QuotaExceededException(user.getPlan().getName(),limit,row.getUsedBytes(),bytes);row.setUsedBytes(row.getUsedBytes()+bytes);return usage.save(row);}
 public void release(MonthlyUploadUsage row,long bytes){row.setUsedBytes(Math.max(0,row.getUsedBytes()-bytes));usage.save(row);}
 private Period period(User user,LocalDate today){if(user.getPlan()==null)throw new IllegalArgumentException("No valid upload plan is assigned");if(!user.getPlan().isActive())throw new IllegalArgumentException("The assigned plan is inactive");LocalDate start=user.getSubscriptionStartDate(), end=user.getSubscriptionEndDate();if(start==null||end==null)throw new IllegalArgumentException("No valid subscription period is assigned");if(today.isBefore(start))throw new IllegalArgumentException("Subscription has not started");if(today.isAfter(end))throw new IllegalArgumentException("Subscription has expired");long months=java.time.temporal.ChronoUnit.MONTHS.between(start.withDayOfMonth(1),today.withDayOfMonth(1));LocalDate periodStart=start.plusMonths(Math.max(0,months));while(periodStart.isAfter(today))periodStart=periodStart.minusMonths(1);LocalDate periodEnd=periodStart.plusMonths(1).minusDays(1);if(periodEnd.isAfter(end))periodEnd=end;return new Period(periodStart,periodEnd);}
 private record Period(LocalDate start,LocalDate end){}
}

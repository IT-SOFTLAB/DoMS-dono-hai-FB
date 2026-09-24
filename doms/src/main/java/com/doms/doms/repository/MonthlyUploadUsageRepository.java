package com.doms.doms.repository;
import com.doms.doms.entity.*;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.Optional;
public interface MonthlyUploadUsageRepository extends JpaRepository<MonthlyUploadUsage,Long>{
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select q from MonthlyUploadUsage q where q.user=:user and q.periodStart=:start") Optional<MonthlyUploadUsage> findForUpdate(User user,LocalDate start);
 Optional<MonthlyUploadUsage> findByUserAndPeriodStart(User user,LocalDate start);
}

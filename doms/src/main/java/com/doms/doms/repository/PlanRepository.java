package com.doms.doms.repository;
import com.doms.doms.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PlanRepository extends JpaRepository<Plan,Long>{List<Plan> findByActiveTrueOrderByMonthlyUploadLimitBytes();java.util.Optional<Plan> findBySlugIgnoreCase(String slug);}

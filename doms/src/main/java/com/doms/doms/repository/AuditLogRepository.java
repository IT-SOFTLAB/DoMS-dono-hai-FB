package com.doms.doms.repository;
import com.doms.doms.entity.*;import org.springframework.data.jpa.repository.JpaRepository;import java.time.LocalDateTime;import java.util.*;
public interface AuditLogRepository extends JpaRepository<AuditLog,Long>{List<AuditLog> findTop200ByUserOrderByCreatedAtDesc(User user);List<AuditLog> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(User user,LocalDateTime from,LocalDateTime to);}

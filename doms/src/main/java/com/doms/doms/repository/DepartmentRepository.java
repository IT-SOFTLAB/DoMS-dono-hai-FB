package com.doms.doms.repository;
import com.doms.doms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Optional<Department> findByNameIgnoreCaseAndUserId(String name, Long userId);
    boolean existsByNameIgnoreCaseAndUserId(String name, Long userId);
    List<Department> findAllByUserIdOrderByNameAsc(Long userId);
}

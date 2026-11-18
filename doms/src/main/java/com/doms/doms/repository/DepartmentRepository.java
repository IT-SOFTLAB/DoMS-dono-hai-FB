package com.doms.doms.repository;
import com.doms.doms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Optional<Department> findByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(String name, Long userId);
    boolean existsByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(String name, Long userId);
    List<Department> findAllByUserIdAndDeletedAtIsNullOrderByNameAsc(Long userId);
    List<Department> findAllByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(Long userId);
    Optional<Department> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
    Optional<Department> findByIdAndUserIdAndDeletedAtIsNotNull(Long id, Long userId);
}

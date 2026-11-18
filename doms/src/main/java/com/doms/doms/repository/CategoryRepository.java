package com.doms.doms.repository;
import com.doms.doms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CategoryRepository extends JpaRepository<Category,Long> {
    Optional<Category> findByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(String name, Long userId);
    boolean existsByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(String name, Long userId);
    List<Category> findAllByUserIdAndDeletedAtIsNullOrderByNameAsc(Long userId);
    List<Category> findAllByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(Long userId);
    Optional<Category> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
    Optional<Category> findByIdAndUserIdAndDeletedAtIsNotNull(Long id, Long userId);
}

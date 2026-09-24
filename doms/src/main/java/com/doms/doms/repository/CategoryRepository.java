package com.doms.doms.repository;
import com.doms.doms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CategoryRepository extends JpaRepository<Category,Long> { Optional<Category> findByNameIgnoreCase(String name); boolean existsByNameIgnoreCase(String name); List<Category> findAllByOrderByNameAsc(); }

package com.doms.doms.repository;
import com.doms.doms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DepartmentRepository extends JpaRepository<Department,Long> { Optional<Department> findByNameIgnoreCase(String name); boolean existsByNameIgnoreCase(String name); List<Department> findAllByOrderByNameAsc(); }

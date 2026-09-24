package com.doms.doms.repository;
import com.doms.doms.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrganizationRepository extends JpaRepository<Organization,Long>{
    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlugIgnoreCase(String slug);
    List<Organization> findByActiveTrueOrderByName();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "INSERT INTO organizations (id, name, slug) VALUES (:id, :name, :slug)", nativeQuery = true)
    void insertWithId(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("name") String name, @org.springframework.data.repository.query.Param("slug") String slug);
}

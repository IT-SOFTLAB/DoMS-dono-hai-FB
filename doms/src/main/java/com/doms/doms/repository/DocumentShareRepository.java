package com.doms.doms.repository;
import com.doms.doms.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DocumentShareRepository extends JpaRepository<DocumentShare,Long> {
    List<DocumentShare> findBySharedToOrderBySharedAtDesc(User user);
    Optional<DocumentShare> findByDocumentAndSharedTo(Document document, User user);
    void deleteByDocument(Document document);
}

package com.doms.doms.repository;
import com.doms.doms.entity.*;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion,Long>{List<DocumentVersion> findByDocumentOrderByVersionNumberDesc(Document document);Optional<DocumentVersion> findByDocumentAndVersionNumber(Document document,Integer version);void deleteByDocument(Document document);}

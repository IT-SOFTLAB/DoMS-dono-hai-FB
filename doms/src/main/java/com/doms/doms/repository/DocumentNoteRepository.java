package com.doms.doms.repository;

import com.doms.doms.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface DocumentNoteRepository extends JpaRepository<DocumentNote, Long> {
    List<DocumentNote> findByUserOrderByCreatedAtDesc(User user);
    List<DocumentNote> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(User user, LocalDateTime from, LocalDateTime to);
    void deleteByDocument(Document document);
}

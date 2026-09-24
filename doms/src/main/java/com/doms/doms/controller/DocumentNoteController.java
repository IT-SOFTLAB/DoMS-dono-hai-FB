package com.doms.doms.controller;

import com.doms.doms.dto.*;
import com.doms.doms.entity.*;
import com.doms.doms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class DocumentNoteController {
    private final DocumentNoteRepository notes;
    private final DocumentRepository documents;
    private final UserRepository users;

    private User current() {
        return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    private DocumentNoteResponse response(DocumentNote note) {
        Document d = note.getDocument();
        return new DocumentNoteResponse(note.getId(), d.getId(), d.getDocumentCode(), d.getFileName(), note.getDescription(), note.getCreatedAt());
    }
    @PostMapping
    public ResponseEntity<DocumentNoteResponse> create(@RequestBody DocumentNoteRequest request) {
        User user = current();
        if (request.getDescription() == null || request.getDescription().trim().isEmpty())
            throw new IllegalArgumentException("Note description is required");
        if (request.getDescription().trim().length() > 2000)
            throw new IllegalArgumentException("Note description must be 2000 characters or fewer");
        Document document = documents.findByUploadedByAndId(user, request.getDocumentId())
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return ResponseEntity.ok(response(notes.save(DocumentNote.builder().document(document).user(user)
                .description(request.getDescription().trim()).createdAt(LocalDateTime.now()).build())));
    }
    @GetMapping
    public ResponseEntity<List<DocumentNoteResponse>> list(@RequestParam(required = false) String from,
                                                            @RequestParam(required = false) String to) {
        User user = current();
        List<DocumentNote> result;
        if ((from != null && !from.isBlank()) || (to != null && !to.isBlank())) {
            LocalDate start = from == null || from.isBlank() ? LocalDate.of(1970, 1, 1) : LocalDate.parse(from);
            LocalDate end = to == null || to.isBlank() ? LocalDate.now() : LocalDate.parse(to);
            if (end.isBefore(start)) throw new IllegalArgumentException("End date cannot be before start date");
            result = notes.findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(user, start.atStartOfDay(), end.plusDays(1).atStartOfDay().minusNanos(1));
        } else result = notes.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(result.stream().map(this::response).toList());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        DocumentNote note = notes.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getUser().getId().equals(current().getId())) throw new org.springframework.security.access.AccessDeniedException("Access denied");
        notes.delete(note);
        return ResponseEntity.noContent().build();
    }
}

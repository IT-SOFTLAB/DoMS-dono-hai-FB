package com.doms.doms.controller;
import com.doms.doms.dto.*;import com.doms.doms.service.DocumentShareService;import jakarta.validation.Valid;import lombok.RequiredArgsConstructor;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/shares") @RequiredArgsConstructor
public class DocumentShareController {private final DocumentShareService service;@PostMapping("/documents/{id}") public ResponseEntity<List<ShareResponse>> share(@PathVariable Long id,@Valid @RequestBody ShareRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.share(id,r));}@GetMapping("/shared-with-me") public ResponseEntity<List<ShareResponse>> mine(){return ResponseEntity.ok(service.sharedWithMe());}}

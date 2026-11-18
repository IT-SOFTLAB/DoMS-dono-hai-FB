package com.doms.doms.serviceImpl;

import com.doms.doms.dto.LookupRequest;
import com.doms.doms.dto.LookupResponse;
import com.doms.doms.dto.LookupTrashResponse;
import com.doms.doms.entity.Category;
import com.doms.doms.entity.User;
import com.doms.doms.exception.ResourceNotFoundException;
import com.doms.doms.repository.CategoryRepository;
import com.doms.doms.repository.UserRepository;
import com.doms.doms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository repository;
    private final UserRepository users;

    private User current() {
        return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public List<LookupResponse> findAll() {
        return repository.findAllByUserIdAndDeletedAtIsNullOrderByNameAsc(current().getId()).stream().map(this::dto).toList();
    }

    @Override
    public List<LookupTrashResponse> trash() {
        return repository.findAllByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(current().getId()).stream()
                .map(item -> new LookupTrashResponse(item.getId(), "CATEGORY", item.getName(), item.getDescription(), item.getCreatedAt(), item.getDeletedAt())).toList();
    }

    @Override
    public LookupResponse create(LookupRequest request) {
        String name = request.name().trim();
        User user = current();
        if (repository.existsByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(name, user.getId())) throw new IllegalArgumentException("Category already exists");
        return dto(repository.save(Category.builder().name(name).description(clean(request.description())).user(user).build()));
    }

    @Override
    public LookupResponse update(Long id, LookupRequest request) {
        Category category = active(id);
        String name = request.name().trim();
        User user = current();
        repository.findByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(name, user.getId()).filter(item -> !item.getId().equals(id))
                .ifPresent(item -> { throw new IllegalArgumentException("Category already exists"); });
        category.setName(name);
        category.setDescription(clean(request.description()));
        return dto(repository.save(category));
    }

    @Override
    public void delete(Long id) { active(id).setDeletedAt(LocalDateTime.now()); }

    @Override
    public void restore(Long id) {
        Category category = trashed(id);
        if (repository.existsByNameIgnoreCaseAndUserIdAndDeletedAtIsNull(category.getName(), current().getId())) throw new IllegalArgumentException("A category with this name already exists");
        category.setDeletedAt(null);
    }

    @Override
    public void purge(Long id) { repository.delete(trashed(id)); }

    private Category active(Long id) {
        return repository.findByIdAndUserIdAndDeletedAtIsNull(id, current().getId()).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private Category trashed(Long id) {
        return repository.findByIdAndUserIdAndDeletedAtIsNotNull(id, current().getId()).orElseThrow(() -> new ResourceNotFoundException("Deleted category not found"));
    }

    private LookupResponse dto(Category item) { return new LookupResponse(item.getId(), item.getName(), item.getDescription(), item.getCreatedAt()); }
    private String clean(String value) { return value == null ? null : value.trim(); }
}

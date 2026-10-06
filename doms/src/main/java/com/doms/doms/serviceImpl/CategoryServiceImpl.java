package com.doms.doms.serviceImpl;
import com.doms.doms.dto.*; import com.doms.doms.entity.Category; import com.doms.doms.exception.*; import com.doms.doms.repository.CategoryRepository; import com.doms.doms.service.CategoryService;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.List;
import com.doms.doms.entity.User; import com.doms.doms.repository.UserRepository; import org.springframework.security.core.context.SecurityContextHolder;
@Service @RequiredArgsConstructor @Transactional
public class CategoryServiceImpl implements CategoryService {
 private final CategoryRepository repository;
 private final UserRepository users;
 private User current(){return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));}
 public List<LookupResponse> findAll(){return repository.findAllByUserIdOrderByNameAsc(current().getId()).stream().map(this::dto).toList();}
 public LookupResponse create(LookupRequest r){String n=r.name().trim(); User u = current(); if(repository.existsByNameIgnoreCaseAndUserId(n, u.getId())) throw new IllegalArgumentException("Category already exists"); return dto(repository.save(Category.builder().name(n).description(clean(r.description())).user(u).build()));}
 public LookupResponse update(Long id,LookupRequest r){Category x=get(id);String n=r.name().trim();User u = current();repository.findByNameIgnoreCaseAndUserId(n, u.getId()).filter(y->!y.getId().equals(id)).ifPresent(y->{throw new IllegalArgumentException("Category already exists");});x.setName(n);x.setDescription(clean(r.description()));return dto(repository.save(x));}
 public void delete(Long id){repository.delete(get(id));}
 private Category get(Long id){Category c = repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Category not found")); if(!c.getUser().getId().equals(current().getId())) throw new ResourceNotFoundException("Category not found"); return c;} private LookupResponse dto(Category x){return new LookupResponse(x.getId(),x.getName(),x.getDescription(),x.getCreatedAt());} private String clean(String s){return s==null?null:s.trim();}
}

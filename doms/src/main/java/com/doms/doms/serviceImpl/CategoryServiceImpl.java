package com.doms.doms.serviceImpl;
import com.doms.doms.dto.*; import com.doms.doms.entity.Category; import com.doms.doms.exception.*; import com.doms.doms.repository.CategoryRepository; import com.doms.doms.service.CategoryService;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.List;
@Service @RequiredArgsConstructor @Transactional
public class CategoryServiceImpl implements CategoryService {
 private final CategoryRepository repository;
 public List<LookupResponse> findAll(){return repository.findAllByOrderByNameAsc().stream().map(this::dto).toList();}
 public LookupResponse create(LookupRequest r){String n=r.name().trim(); if(repository.existsByNameIgnoreCase(n)) throw new IllegalArgumentException("Category already exists"); return dto(repository.save(Category.builder().name(n).description(clean(r.description())).build()));}
 public LookupResponse update(Long id,LookupRequest r){Category x=get(id);String n=r.name().trim();repository.findByNameIgnoreCase(n).filter(y->!y.getId().equals(id)).ifPresent(y->{throw new IllegalArgumentException("Category already exists");});x.setName(n);x.setDescription(clean(r.description()));return dto(repository.save(x));}
 public void delete(Long id){repository.delete(get(id));}
 private Category get(Long id){return repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Category not found"));} private LookupResponse dto(Category x){return new LookupResponse(x.getId(),x.getName(),x.getDescription(),x.getCreatedAt());} private String clean(String s){return s==null?null:s.trim();}
}

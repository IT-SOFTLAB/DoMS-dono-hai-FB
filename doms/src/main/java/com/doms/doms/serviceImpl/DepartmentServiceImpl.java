package com.doms.doms.serviceImpl;
import com.doms.doms.dto.*; import com.doms.doms.entity.Department; import com.doms.doms.exception.*; import com.doms.doms.repository.DepartmentRepository; import com.doms.doms.service.DepartmentService;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.List;
import com.doms.doms.entity.User; import com.doms.doms.repository.UserRepository; import org.springframework.security.core.context.SecurityContextHolder;
@Service @RequiredArgsConstructor @Transactional
public class DepartmentServiceImpl implements DepartmentService {
 private final DepartmentRepository repository;
 private final UserRepository users;
 private User current(){return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(()->new ResourceNotFoundException("User not found"));}
 public List<LookupResponse> findAll(){return repository.findAllByUserIdOrderByNameAsc(current().getId()).stream().map(this::dto).toList();}
 public LookupResponse create(LookupRequest r){String n=r.name().trim(); User u = current(); if(repository.existsByNameIgnoreCaseAndUserId(n, u.getId()))throw new IllegalArgumentException("Department already exists");return dto(repository.save(Department.builder().name(n).description(clean(r.description())).user(u).build()));}
 public LookupResponse update(Long id,LookupRequest r){Department x=get(id);String n=r.name().trim();User u = current();repository.findByNameIgnoreCaseAndUserId(n, u.getId()).filter(y->!y.getId().equals(id)).ifPresent(y->{throw new IllegalArgumentException("Department already exists");});x.setName(n);x.setDescription(clean(r.description()));return dto(repository.save(x));}
 public void delete(Long id){repository.delete(get(id));}
 private Department get(Long id){Department d = repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Department not found")); if(!d.getUser().getId().equals(current().getId())) throw new ResourceNotFoundException("Department not found"); return d;}private LookupResponse dto(Department x){return new LookupResponse(x.getId(),x.getName(),x.getDescription(),x.getCreatedAt());}private String clean(String s){return s==null?null:s.trim();}
}

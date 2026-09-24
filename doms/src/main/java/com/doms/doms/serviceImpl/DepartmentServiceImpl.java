package com.doms.doms.serviceImpl;
import com.doms.doms.dto.*; import com.doms.doms.entity.Department; import com.doms.doms.exception.*; import com.doms.doms.repository.DepartmentRepository; import com.doms.doms.service.DepartmentService;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.List;
@Service @RequiredArgsConstructor @Transactional
public class DepartmentServiceImpl implements DepartmentService {
 private final DepartmentRepository repository;
 public List<LookupResponse> findAll(){return repository.findAllByOrderByNameAsc().stream().map(this::dto).toList();}
 public LookupResponse create(LookupRequest r){String n=r.name().trim();if(repository.existsByNameIgnoreCase(n))throw new IllegalArgumentException("Department already exists");return dto(repository.save(Department.builder().name(n).description(clean(r.description())).build()));}
 public LookupResponse update(Long id,LookupRequest r){Department x=get(id);String n=r.name().trim();repository.findByNameIgnoreCase(n).filter(y->!y.getId().equals(id)).ifPresent(y->{throw new IllegalArgumentException("Department already exists");});x.setName(n);x.setDescription(clean(r.description()));return dto(repository.save(x));}
 public void delete(Long id){repository.delete(get(id));}
 private Department get(Long id){return repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Department not found"));}private LookupResponse dto(Department x){return new LookupResponse(x.getId(),x.getName(),x.getDescription(),x.getCreatedAt());}private String clean(String s){return s==null?null:s.trim();}
}

package com.doms.doms.service;
import com.doms.doms.dto.*;
import com.doms.doms.entity.Organization;
import com.doms.doms.exception.ConflictException;
import com.doms.doms.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class OrganizationService {
 private final OrganizationRepository organizations;
 @Transactional public OrganizationResponse create(OrganizationRequest request){
  String name=request.name().trim(), slug=name.toLowerCase().replaceAll("[^a-z0-9]+","-").replaceAll("(^-|-$)","");
  if(slug.isBlank()) throw new IllegalArgumentException("Organization name must contain letters or numbers");
  if(organizations.existsByNameIgnoreCase(name)||organizations.existsBySlugIgnoreCase(slug)) throw new ConflictException("Organization already exists");
  Organization saved=organizations.save(Organization.builder().name(name).slug(slug).build());return dto(saved);
 }
 public List<OrganizationResponse> active(){return organizations.findByActiveTrueOrderByName().stream().map(this::dto).toList();}
 private OrganizationResponse dto(Organization o){return new OrganizationResponse(o.getId(),o.getName(),o.getSlug());}
}

package com.doms.doms.service;
import com.doms.doms.dto.*;
import java.util.List;
public interface CategoryService { List<LookupResponse> findAll(); LookupResponse create(LookupRequest request); LookupResponse update(Long id, LookupRequest request); void delete(Long id); }

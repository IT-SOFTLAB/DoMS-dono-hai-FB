package com.doms.doms.repository;
import com.doms.doms.entity.*;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface FolderRepository extends JpaRepository<Folder,Long>{List<Folder> findByOwnerOrderByName(User owner);Optional<Folder> findByIdAndOwner(Long id,User owner);boolean existsByOwnerAndParentAndNameIgnoreCase(User owner,Folder parent,String name);}

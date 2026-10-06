package com.doms.doms.serviceImpl;

import com.doms.doms.dto.*;
import com.doms.doms.entity.*;
import com.doms.doms.repository.*;
import com.doms.doms.service.*;
import com.doms.doms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service @RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documents;
    private final UserRepository users;
    private final FileStorageService files;
    private final CategoryRepository categories;
    private final DepartmentRepository departments;
    private final DocumentShareRepository shares;
    private final DocumentNoteRepository notes;
    private final FolderRepository folders;
    private final DocumentVersionRepository versions;
    private final AuditService audit;
    private final QuotaService quota;

    private User current(){return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(()->new RuntimeException("User not found"));}
    private Document owned(Long id){User u=current(); return u.getRole()==Role.ROLE_ADMIN?documents.findById(id).orElseThrow(()->new ResourceNotFoundException("Document not found")):documents.findByUploadedByAndId(u,id).orElseThrow(()->new org.springframework.security.access.AccessDeniedException("Only the owner can perform this action"));}
    private Document accessible(Long id, SharePermission required){User u=current();Document d=documents.findById(id).orElseThrow(()->new ResourceNotFoundException("Document not found"));if(d.getDeletedAt()!=null)throw new ResourceNotFoundException("Document is in the recycle bin");if(u.getRole()==Role.ROLE_ADMIN||d.getUploadedBy().getId().equals(u.getId()))return d;DocumentShare s=shares.findByDocumentAndSharedTo(d,u).orElseThrow(()->new org.springframework.security.access.AccessDeniedException("Document access denied"));if(s.getPermission().ordinal()<required.ordinal())throw new org.springframework.security.access.AccessDeniedException("Insufficient shared permission");return d;}
    private DocumentResponseDTO dto(Document d){User u=d.getUploadedBy();Folder f=d.getFolder();return new DocumentResponseDTO(d.getId(),d.getFileName(),null,d.getFileType(),d.getFileSize(),d.getDescription(),new UserResponseDTO(u.getId(),u.getFullName(),u.getEmail(),u.getRole()),d.getDocumentCode(),d.getCategory(),d.getDepartment(),d.getDocumentDate(),d.getTags(),d.getUploadedAt(),d.getReferenceNumber(),d.getDocumentOwner(),d.getConfidentiality(),d.getDocumentStatus(),d.getFiscalYear(),d.getStorageLocation(),f==null?null:f.getId(),f==null?null:f.getName(),d.getCurrentVersion(),d.getDeletedAt());}

    @Transactional
    public DocumentResponseDTO uploadDocument(MultipartFile file, DocumentRequest m){
        User principal=current();User u=users.findByEmailForUpdate(principal.getEmail()).orElseThrow(()->new RuntimeException("User not found"));
        validateUpload(file);quota.reserve(u,file.getSize());
        String hash=hash(file);documents.findFirstByUploadedByAndContentHashAndDeletedAtIsNull(u,hash).ifPresent(existing->{throw new IllegalArgumentException("Duplicate file detected. This content already exists as "+existing.getDocumentCode()+" ("+existing.getFileName()+")");});
        String category=clean(m.getCategory(),""); String department=clean(m.getDepartment(),""); String type=clean(m.getFileType(),extension(file.getOriginalFilename()));
        if(!categories.existsByNameIgnoreCaseAndUserId(category, u.getId())) throw new IllegalArgumentException("Select a valid category");
        if(!departments.existsByNameIgnoreCaseAndUserId(department, u.getId())) throw new IllegalArgumentException("Select a valid department");
        Folder folder=m.getFolderId()==null?null:folders.findByIdAndOwner(m.getFolderId(),u).orElseThrow(()->new IllegalArgumentException("Folder not found"));
        String code=code(category,type,u.getId()); String stored=files.saveFile(file);
        Document d=Document.builder().fileName(clean(m.getFileName(),file.getOriginalFilename())).filePath(stored).fileType(type.toUpperCase()).fileSize(file.getSize()).description(m.getDescription()).category(category).department(department).documentDate(clean(m.getDocumentDate(),LocalDate.now().toString())).tags(m.getTags()).referenceNumber(m.getReferenceNumber()).documentOwner(m.getDocumentOwner()).confidentiality(clean(m.getConfidentiality(),"INTERNAL")).documentStatus(clean(m.getDocumentStatus(),"ACTIVE")).fiscalYear(m.getFiscalYear()).storageLocation(m.getStorageLocation()).documentCode(code).uploadedAt(LocalDateTime.now()).uploadedBy(u).folder(folder).contentHash(hash).currentVersion(1).build();
        try {
            // The document row must exist before document_versions can reference it.
            Document saved=documents.saveAndFlush(d);
            versions.saveAndFlush(DocumentVersion.builder()
                    .document(saved).versionNumber(1).filePath(stored)
                    .fileName(saved.getFileName()).fileType(saved.getFileType())
                    .fileSize(saved.getFileSize()).contentHash(hash).createdBy(u)
                    .createdAt(saved.getUploadedAt()).changeNote("Initial upload").build());
            audit.record(u,saved,"UPLOAD","Uploaded version 1");
            u.setDocumentsUsed((int)documents.findByUploadedBy(u).stream().filter(x->x.getDeletedAt()==null).count());
            users.save(u);
            return dto(saved);
        } catch (RuntimeException exception) {
            // Do not leave an orphaned file when a database constraint rejects the upload.
            files.deleteFile(stored);
            throw exception;
        }
    }
    private String clean(String v,String fallback){return v==null||v.isBlank()?fallback:v.trim();}
    private void validateUpload(MultipartFile file){if(file==null||file.isEmpty())throw new IllegalArgumentException("Select a non-empty file");}
    private String extension(String n){int i=n==null?-1:n.lastIndexOf('.');return i<0?"FILE":n.substring(i+1);}
    private String code(String category,String type,Long uid){String a=category.replaceAll("[^A-Za-z0-9]","").toUpperCase(); if(a.length()>4)a=a.substring(0,4); String b=type.replaceAll("[^A-Za-z0-9]","").toUpperCase(); if(b.length()>4)b=b.substring(0,4); return String.format("DOC-%s-%s-U%03d-%s",a,b,uid,UUID.randomUUID().toString().substring(0,8).toUpperCase());}
    public List<DocumentResponseDTO> getAllDocuments(){User u=current();return (u.getRole()==Role.ROLE_ADMIN?documents.findAll():documents.findByUploadedBy(u)).stream().filter(d->d.getDeletedAt()==null).sorted(Comparator.comparing(Document::getUploadedAt,Comparator.nullsLast(Comparator.reverseOrder()))).map(this::dto).toList();}
    public DocumentResponseDTO getDocumentById(Long id){return dto(accessible(id,SharePermission.VIEW));}
    @Transactional
    public void deleteDocument(Long id){Document d=owned(id);if(d.getDeletedAt()!=null)return;d.setDeletedAt(LocalDateTime.now());documents.save(d);audit.record(current(),d,"DELETE","Moved to recycle bin");User u=d.getUploadedBy();u.setDocumentsUsed((int)documents.findByUploadedBy(u).stream().filter(x->x.getDeletedAt()==null).count());users.save(u);}
    public DocumentResponseDTO updateDocument(Long id,DocumentRequest m){Document d=accessible(id,SharePermission.EDIT);User u=current();if(m.getFileName()!=null)d.setFileName(m.getFileName());if(m.getFileType()!=null)d.setFileType(m.getFileType());if(m.getCategory()!=null&&categories.existsByNameIgnoreCaseAndUserId(m.getCategory(), u.getId()))d.setCategory(m.getCategory());if(m.getDescription()!=null)d.setDescription(m.getDescription());if(m.getDepartment()!=null&&departments.existsByNameIgnoreCaseAndUserId(m.getDepartment(), u.getId()))d.setDepartment(m.getDepartment());if(m.getDocumentDate()!=null)d.setDocumentDate(m.getDocumentDate());if(m.getTags()!=null)d.setTags(m.getTags());if(m.getReferenceNumber()!=null)d.setReferenceNumber(m.getReferenceNumber());if(m.getDocumentOwner()!=null)d.setDocumentOwner(m.getDocumentOwner());if(m.getConfidentiality()!=null)d.setConfidentiality(m.getConfidentiality());if(m.getDocumentStatus()!=null)d.setDocumentStatus(m.getDocumentStatus());if(m.getFiscalYear()!=null)d.setFiscalYear(m.getFiscalYear());if(m.getStorageLocation()!=null)d.setStorageLocation(m.getStorageLocation());audit.record(current(),d,"EDIT","Document metadata updated");return dto(documents.save(d));}
    public Resource downloadDocument(Long id){Document d=accessible(id,SharePermission.DOWNLOAD);audit.record(current(),d,"DOWNLOAD","Downloaded current version");return files.downloadFile(d.getFilePath());}
    public Resource viewDocument(Long id){Document d=accessible(id,SharePermission.VIEW);audit.record(current(),d,"PREVIEW","Opened browser preview");return files.viewFile(d.getFilePath());}
    public List<DocumentResponseDTO> searchDocuments(String q){return advancedSearch(null,null,null,q,null,null,null,null,null,null,null);}
    public DocumentResponseDTO searchByCode(String code){User u=current();Document d=u.getRole()==Role.ROLE_ADMIN?documents.findByDocumentCodeIgnoreCase(code).orElseThrow(()->new RuntimeException("Document not found")):documents.findByUploadedByAndDocumentCodeIgnoreCase(u,code).orElseThrow(()->new RuntimeException("Document not found"));if(d.getDeletedAt()!=null)throw new RuntimeException("Document is in the recycle bin");return dto(d);}
    public List<DocumentResponseDTO> advancedSearch(String type,String category,String department,String name,String owner,String confidentiality,String status,String fiscalYear,String referenceNumber,String tags,String uploadDate){return getAllDocuments().stream().filter(d->matchExact(d.getFileType(),type)).filter(d->matchContains(d.getCategory(),category)).filter(d->matchContains(d.getDepartment(),department)).filter(d->matchContains(d.getFileName(),name)).filter(d->matchContains(d.getDocumentOwner(),owner)).filter(d->matchExact(d.getConfidentiality(),confidentiality)).filter(d->matchExact(d.getDocumentStatus(),status)).filter(d->matchExact(d.getFiscalYear(),fiscalYear)).filter(d->matchContains(d.getReferenceNumber(),referenceNumber)).filter(d->matchContains(d.getTags(),tags)).filter(d->uploadDate==null||uploadDate.isBlank()||d.getUploadedAt()!=null&&d.getUploadedAt().toLocalDate().toString().equals(uploadDate)).toList();}
    private boolean matchExact(String value,String filter){return filter==null||filter.isBlank()||Objects.toString(value,"").equalsIgnoreCase(filter);}
    private boolean matchContains(String value,String filter){return filter==null||filter.isBlank()||Objects.toString(value,"").toLowerCase().contains(filter.toLowerCase());}
    private String hash(MultipartFile file){try{MessageDigest digest=MessageDigest.getInstance("SHA-256");return HexFormat.of().formatHex(digest.digest(file.getBytes()));}catch(Exception e){throw new RuntimeException("Could not inspect file",e);}}
    public List<DocumentResponseDTO> trash(){return documents.findByUploadedByAndDeletedAtIsNotNullOrderByDeletedAtDesc(current()).stream().map(this::dto).toList();}
    public DocumentResponseDTO restore(Long id){Document d=owned(id);d.setDeletedAt(null);audit.record(current(),d,"RESTORE","Restored from recycle bin");Document saved=documents.save(d);User u=d.getUploadedBy();u.setDocumentsUsed((int)documents.findByUploadedBy(u).stream().filter(x->x.getDeletedAt()==null).count());users.save(u);return dto(saved);}
    @Transactional public void purge(Long id){Document d=owned(id);if(d.getDeletedAt()==null)throw new IllegalArgumentException("Move the document to the recycle bin first");audit.record(current(),d,"PERMANENT_DELETE","Permanently deleted document and versions");Set<String> paths=new HashSet<>();versions.findByDocumentOrderByVersionNumberDesc(d).forEach(v->paths.add(v.getFilePath()));paths.add(d.getFilePath());paths.forEach(files::deleteFile);shares.deleteByDocument(d);notes.deleteByDocument(d);versions.deleteByDocument(d);documents.delete(d);}
    public DocumentResponseDTO move(Long id,Long folderId){Document d=owned(id);Folder f=folderId==null?null:folders.findByIdAndOwner(folderId,current()).orElseThrow(()->new IllegalArgumentException("Folder not found"));d.setFolder(f);audit.record(current(),d,"MOVE",f==null?"Moved to My Documents":"Moved to folder "+f.getName());return dto(documents.save(d));}
    public List<VersionResponse> versionList(Long id){Document d=accessible(id,SharePermission.VIEW);ensureInitialVersion(d);return versions.findByDocumentOrderByVersionNumberDesc(d).stream().map(v->new VersionResponse(v.getId(),v.getVersionNumber(),v.getFileName(),v.getFileSize(),v.getCreatedBy().getFullName(),v.getCreatedAt(),v.getChangeNote())).toList();}
    @Transactional
    public DocumentResponseDTO addVersion(Long id,MultipartFile file,String note){
        Document d=owned(id);User owner=users.findByEmailForUpdate(d.getUploadedBy().getEmail()).orElseThrow();validateUpload(file);quota.reserve(owner,file.getSize());ensureInitialVersion(d);String h=hash(file);
        if(h.equals(d.getContentHash()))throw new IllegalArgumentException("This file is identical to the current version");
        String path=files.saveFile(file);
        try {
            int number=Optional.ofNullable(d.getCurrentVersion()).orElse(1)+1;
            String type=extension(file.getOriginalFilename()).toUpperCase();
            DocumentVersion v=DocumentVersion.builder().document(d).versionNumber(number).filePath(path).fileName(clean(file.getOriginalFilename(),d.getFileName())).fileType(type).fileSize(file.getSize()).contentHash(h).createdBy(current()).createdAt(LocalDateTime.now()).changeNote(clean(note,"New version uploaded")).build();
            versions.saveAndFlush(v);d.setFilePath(path);d.setFileName(v.getFileName());d.setFileType(type);d.setFileSize(file.getSize());d.setContentHash(h);d.setCurrentVersion(number);audit.record(current(),d,"NEW_VERSION","Uploaded version "+number);
            return dto(documents.saveAndFlush(d));
        } catch (RuntimeException exception) {
            files.deleteFile(path);
            throw exception;
        }
    }
    public DocumentResponseDTO rollback(Long id,Integer version){Document d=owned(id);DocumentVersion target=versions.findByDocumentAndVersionNumber(d,version).orElseThrow(()->new ResourceNotFoundException("Version not found"));int number=Optional.ofNullable(d.getCurrentVersion()).orElse(1)+1;versions.save(DocumentVersion.builder().document(d).versionNumber(number).filePath(target.getFilePath()).fileName(target.getFileName()).fileType(target.getFileType()).fileSize(target.getFileSize()).contentHash(target.getContentHash()).createdBy(current()).createdAt(LocalDateTime.now()).changeNote("Restored from version "+version).build());d.setFilePath(target.getFilePath());d.setFileName(target.getFileName());d.setFileType(target.getFileType());d.setFileSize(target.getFileSize());d.setContentHash(target.getContentHash());d.setCurrentVersion(number);audit.record(current(),d,"ROLLBACK","Rolled back version "+version+" as version "+number);return dto(documents.save(d));}
    private void ensureInitialVersion(Document d){if(versions.findByDocumentOrderByVersionNumberDesc(d).isEmpty()){d.setCurrentVersion(1);documents.save(d);versions.save(DocumentVersion.builder().document(d).versionNumber(1).filePath(d.getFilePath()).fileName(d.getFileName()).fileType(d.getFileType()).fileSize(d.getFileSize()).contentHash(d.getContentHash()).createdBy(d.getUploadedBy()).createdAt(d.getUploadedAt()==null?LocalDateTime.now():d.getUploadedAt()).changeNote("Original document").build());}}
}

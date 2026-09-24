package com.doms.doms.service;

import com.doms.doms.dto.DocumentRequest;
import com.doms.doms.dto.DocumentResponseDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {


    // Upload document
    DocumentResponseDTO uploadDocument(MultipartFile file, DocumentRequest metadata);



    // Get all documents
    List<DocumentResponseDTO> getAllDocuments();



    // Get document by id
    DocumentResponseDTO getDocumentById(Long id);



    // Update document
    DocumentResponseDTO updateDocument(Long id,
                                       DocumentRequest request);



    // Delete document
    void deleteDocument(Long id);



    // Download document
    Resource downloadDocument(Long id);



    // Preview document
    Resource viewDocument(Long id);



    // Search documents
    List<DocumentResponseDTO> searchDocuments(String keyword);
    List<DocumentResponseDTO> advancedSearch(String type, String category, String department, String name,
                                              String owner, String confidentiality, String status,
                                              String fiscalYear, String referenceNumber, String tags, String uploadDate);
    DocumentResponseDTO searchByCode(String code);
    List<DocumentResponseDTO> trash();
    DocumentResponseDTO restore(Long id);
    void purge(Long id);
    DocumentResponseDTO move(Long id, Long folderId);
    List<com.doms.doms.dto.VersionResponse> versionList(Long id);
    DocumentResponseDTO addVersion(Long id, MultipartFile file, String note);
    DocumentResponseDTO rollback(Long id, Integer version);

}

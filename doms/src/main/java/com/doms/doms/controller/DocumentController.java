package com.doms.doms.controller;

import com.doms.doms.dto.DocumentRequest;
import com.doms.doms.dto.DocumentResponseDTO;
import com.doms.doms.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin
public class DocumentController {


    private final DocumentService documentService;



    // Upload Document
    @PostMapping("/upload")
    public ResponseEntity<DocumentResponseDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam String fileType,
            @RequestParam String category,
            @RequestParam String fileName,
            @RequestParam(required=false, defaultValue="") String description,
            @RequestParam(required=false, defaultValue="") String department,
            @RequestParam(required=false, defaultValue="") String documentDate,
            @RequestParam(required=false, defaultValue="") String tags,
            @RequestParam(required=false, defaultValue="") String referenceNumber,
            @RequestParam(required=false, defaultValue="") String documentOwner,
            @RequestParam(required=false, defaultValue="INTERNAL") String confidentiality,
            @RequestParam(required=false, defaultValue="ACTIVE") String documentStatus,
            @RequestParam(required=false, defaultValue="") String fiscalYear,
            @RequestParam(required=false, defaultValue="") String storageLocation,
            @RequestParam(required=false) Long folderId) {


        return ResponseEntity.status(HttpStatus.CREATED).body(
                documentService.uploadDocument(file, metadata(fileType, category, fileName, description, department, documentDate, tags, referenceNumber, documentOwner, confidentiality, documentStatus, fiscalYear, storageLocation, folderId))
        );
    }





    // Get All Documents
    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> getAllDocuments() {


        return ResponseEntity.ok(
                documentService.getAllDocuments()
        );
    }





    // Get Document By ID
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> getDocumentById(
            @PathVariable Long id) {


        return ResponseEntity.ok(
                documentService.getDocumentById(id)
        );
    }





    // Download Document
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id) {

        DocumentResponseDTO document = documentService.getDocumentById(id);
        Resource resource =
                documentService.downloadDocument(id);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detected = java.net.URLConnection.guessContentTypeFromName(document.getFileName());
            if (document.getFileName().toLowerCase().endsWith(".pdf") || "PDF".equalsIgnoreCase(document.getFileType())) mediaType=MediaType.APPLICATION_PDF;
            else if (detected != null) mediaType = MediaType.parseMediaType(detected);
        } catch (Exception ignored) { }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(document.getFileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(document.getFileName(), java.nio.charset.StandardCharsets.UTF_8)
                                .build().toString()
                )
                .body(resource);
    }





    // Preview / View Document
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long id) {

        DocumentResponseDTO document = documentService.getDocumentById(id);
        Resource resource =
                documentService.viewDocument(id);



        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try { String detected=java.net.URLConnection.guessContentTypeFromName(document.getFileName());if(document.getFileName().toLowerCase().endsWith(".pdf")||"PDF".equalsIgnoreCase(document.getFileType()))mediaType=MediaType.APPLICATION_PDF;else if(detected!=null)mediaType=MediaType.parseMediaType(detected); } catch(Exception ignored){}
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(document.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(document.getFileName(),java.nio.charset.StandardCharsets.UTF_8).build().toString())
                .body(resource);
    }





    // Update Document
    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> updateDocument(
            @PathVariable Long id,
            @RequestBody DocumentRequest request) {


        return ResponseEntity.ok(
                documentService.updateDocument(id, request)
        );
    }





    // Delete Document
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDocument(
            @PathVariable Long id) {


        documentService.deleteDocument(id);


        return ResponseEntity.ok(
                "Document deleted successfully"
        );
    }
@GetMapping("/search")
public ResponseEntity<List<DocumentResponseDTO>> searchDocuments(
        @RequestParam String keyword
) {

    return ResponseEntity.ok(
            documentService.searchDocuments(keyword)
    );
}
private DocumentRequest metadata(String type,String category,String name,String description,String department,String date,String tags,String referenceNumber,String owner,String confidentiality,String status,String fiscalYear,String storageLocation,Long folderId){
    DocumentRequest r=new DocumentRequest(); r.setFileType(type);r.setCategory(category);r.setFileName(name);r.setDescription(description);r.setDepartment(department);r.setDocumentDate(date);r.setTags(tags);r.setReferenceNumber(referenceNumber);r.setDocumentOwner(owner);r.setConfidentiality(confidentiality);r.setDocumentStatus(status);r.setFiscalYear(fiscalYear);r.setStorageLocation(storageLocation);r.setFolderId(folderId);return r;
}
@GetMapping("/code/{code}") public ResponseEntity<DocumentResponseDTO> byCode(@PathVariable String code){return ResponseEntity.ok(documentService.searchByCode(code));}
@GetMapping("/advanced-search") public ResponseEntity<List<DocumentResponseDTO>> advanced(@RequestParam(required=false) String type,@RequestParam(required=false) String category,@RequestParam(required=false) String department,@RequestParam(required=false) String name,@RequestParam(required=false) String owner,@RequestParam(required=false) String confidentiality,@RequestParam(required=false) String status,@RequestParam(required=false) String fiscalYear,@RequestParam(required=false) String referenceNumber,@RequestParam(required=false) String tags,@RequestParam(required=false) String uploadDate){return ResponseEntity.ok(documentService.advancedSearch(type,category,department,name,owner,confidentiality,status,fiscalYear,referenceNumber,tags,uploadDate));}
@GetMapping("/trash") public ResponseEntity<List<DocumentResponseDTO>> trash(){return ResponseEntity.ok(documentService.trash());}
@PutMapping("/{id}/restore") public ResponseEntity<DocumentResponseDTO> restore(@PathVariable Long id){return ResponseEntity.ok(documentService.restore(id));}
@DeleteMapping("/{id}/permanent") public ResponseEntity<Void> purge(@PathVariable Long id){documentService.purge(id);return ResponseEntity.noContent().build();}
@PutMapping("/{id}/folder") public ResponseEntity<DocumentResponseDTO> move(@PathVariable Long id,@RequestParam(required=false) Long folderId){return ResponseEntity.ok(documentService.move(id,folderId));}
@GetMapping("/{id}/versions") public ResponseEntity<List<com.doms.doms.dto.VersionResponse>> versions(@PathVariable Long id){return ResponseEntity.ok(documentService.versionList(id));}
@PostMapping("/{id}/versions") public ResponseEntity<DocumentResponseDTO> version(@PathVariable Long id,@RequestParam("file") MultipartFile file,@RequestParam(required=false,defaultValue="") String note){return ResponseEntity.ok(documentService.addVersion(id,file,note));}
@PostMapping("/{id}/versions/{version}/rollback") public ResponseEntity<DocumentResponseDTO> rollback(@PathVariable Long id,@PathVariable Integer version){return ResponseEntity.ok(documentService.rollback(id,version));}
}

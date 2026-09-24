package com.doms.doms.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    // Save file and return file path
    String saveFile(MultipartFile file);

    // Download file
    Resource downloadFile(String filePath);

    // View / Preview file
    Resource viewFile(String filePath);

    // Delete file
    void deleteFile(String filePath);
}
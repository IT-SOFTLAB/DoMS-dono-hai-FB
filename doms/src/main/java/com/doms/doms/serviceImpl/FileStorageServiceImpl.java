package com.doms.doms.serviceImpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.doms.doms.service.FileStorageService;
import com.doms.doms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:doms/documents}")
    private String cloudinaryFolder;
    @Value("${cloudinary.cloud-name:}")
    private String cloudName;
    @Value("${cloudinary.api-key:}")
    private String apiKey;
    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Override
    public String saveFile(MultipartFile file) {
        ensureConfigured();
        try {
            String originalName = safeFileName(file.getOriginalFilename());
            String publicId = cloudinaryFolder + "/" + UUID.randomUUID() + "-" + originalName;
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "public_id", publicId,
                    "overwrite", false
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) throw new IllegalStateException("Cloudinary did not return a secure URL");
            return secureUrl.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload document to Cloudinary.", e);
        }
    }

    @Override
    public Resource downloadFile(String filePath) {
        try {
            if (isCloudinaryUrl(filePath)) {
                try { byte[] bytes=RestClient.create().get().uri(URI.create(filePath)).retrieve().body(byte[].class);if(bytes==null)throw new ResourceNotFoundException("Stored file not found");return new ByteArrayResource(bytes); }
                catch(HttpClientErrorException.NotFound e){throw new ResourceNotFoundException("Stored file not found");}
            }
            Resource resource = new UrlResource(Paths.get(filePath).toUri());
            if (resource.exists()) {
                return resource;
            }
            throw new ResourceNotFoundException("Stored file not found");
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid document location.", e);
        }
    }

    @Override
    public Resource viewFile(String filePath) {
        return downloadFile(filePath);
    }

    @Override
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        if (isCloudinaryUrl(filePath)) {
            ensureConfigured();
            try {
                cloudinary.uploader().destroy(publicId(filePath), ObjectUtils.asMap(
                        "resource_type", "raw",
                        "invalidate", true
                ));
                return;
            } catch (IOException e) {
                throw new RuntimeException("Unable to delete document from Cloudinary.", e);
            }
        }
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Unable to delete file.", e);
        }
    }

    private void ensureConfigured() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
        }
    }

    private boolean isCloudinaryUrl(String location) {
        return location != null && location.startsWith("https://res.cloudinary.com/");
    }

    private String publicId(String secureUrl) {
        String path = URI.create(secureUrl).getRawPath();
        String marker = "/raw/upload/";
        int markerIndex = path.indexOf(marker);
        if (markerIndex < 0) throw new IllegalArgumentException("Invalid Cloudinary raw asset URL");
        String value = path.substring(markerIndex + marker.length()).replaceFirst("^v\\d+/", "");
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private String safeFileName(String originalName) {
        String name = originalName == null || originalName.isBlank() ? "document" : Paths.get(originalName).getFileName().toString();
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}

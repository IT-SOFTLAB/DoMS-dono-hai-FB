package com.doms.doms.service;
import com.doms.doms.dto.*;
import java.util.List;
public interface DocumentShareService { List<ShareResponse> share(Long documentId, ShareRequest request); List<ShareResponse> sharedWithMe(); }

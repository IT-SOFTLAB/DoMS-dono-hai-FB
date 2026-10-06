package com.doms.doms.exception;

import com.doms.doms.response.ApiResponse;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFoundException ex) {

        ApiResponse response = new ApiResponse(
                false,
                ex.getMessage()
        );

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        ApiResponse response = new ApiResponse(false, message);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleBadRequest(Exception ex) {
        return ResponseEntity.badRequest().body(new ApiResponse(false, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse> handleConflict(ConflictException ex){return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(false,ex.getMessage()));}

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleIntegrity(DataIntegrityViolationException ex){return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(false,"Duplicate or conflicting data"));}

    @ExceptionHandler({ DataAccessResourceFailureException.class, CannotCreateTransactionException.class })
    public ResponseEntity<ApiResponse> handleDatabaseUnavailable(Exception ex) {
        log.warn("Database connection is unavailable", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse(false, "Database is temporarily unavailable. Please retry in a moment."));
    }

    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<Map<String,Object>> handleQuota(QuotaExceededException ex){return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("error",ex.getMessage(),"plan",ex.getPlan(),"monthlyLimitBytes",ex.getLimitBytes(),"usedBytes",ex.getUsedBytes(),"remainingBytes",ex.getRemainingBytes(),"attemptedUploadBytes",ex.getAttemptedBytes()));}

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(false, ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Bad credentials"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {

        log.error("Unhandled request failure", ex);

        ApiResponse response = new ApiResponse(
                false,
                "Request failed. Please contact your administrator."
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}

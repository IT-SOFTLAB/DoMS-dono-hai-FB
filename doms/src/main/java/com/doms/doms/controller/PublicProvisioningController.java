package com.doms.doms.controller;
import com.doms.doms.dto.*;
import com.doms.doms.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/public") @RequiredArgsConstructor
public class PublicProvisioningController {
 private final OrganizationService organizations;private final UserService users;
 @PostMapping("/organizations") public ResponseEntity<OrganizationResponse> createOrganization(@Valid @RequestBody OrganizationRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(organizations.create(r));}
 @PostMapping("/users") public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(users.createPublicUser(r));}
}

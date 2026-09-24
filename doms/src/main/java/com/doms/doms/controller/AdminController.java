package com.doms.doms.controller;


import com.doms.doms.dto.CreateUserRequest;
import com.doms.doms.dto.UpdateUserRequest;
import com.doms.doms.dto.UserResponse;
import com.doms.doms.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;
import com.doms.doms.service.OrganizationService;
import com.doms.doms.dto.OrganizationResponse;
import com.doms.doms.dto.PlanResponse;
import com.doms.doms.repository.PlanRepository;

//saaaaaaa
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {


    private final UserService userService;
    private final OrganizationService organizationService;
    private final PlanRepository planRepository;

    @GetMapping("/organizations") public List<OrganizationResponse> organizations(){return organizationService.active();}
    @GetMapping("/plans") public List<PlanResponse> plans(){return planRepository.findByActiveTrueOrderByMonthlyUploadLimitBytes().stream().map(p->new PlanResponse(p.getId(),p.getName(),p.getSlug(),p.getMonthlyUploadLimitBytes())).toList();}



    // Create User
    @PostMapping("/create-user")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                userService.createUser(request)
        );
    }



    // Get All Users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }



    // Get User By ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }



    // Update User
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                userService.updateUser(id, request)
        );
    }



    // Delete User
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {


        userService.deleteUser(id);


        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

}

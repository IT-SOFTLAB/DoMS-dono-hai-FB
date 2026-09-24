package com.doms.doms.service;


import com.doms.doms.dto.CreateUserRequest;
import com.doms.doms.dto.UpdateUserRequest;
import com.doms.doms.dto.UserResponse;

import java.util.List;


public interface UserService {


    // ============================
    // ADMIN APIs
    // ============================

    UserResponse createUser(CreateUserRequest request);
    UserResponse createPublicUser(CreateUserRequest request);


    List<UserResponse> getAllUsers();


    UserResponse getUserById(Long id);


    UserResponse updateUser(Long id, UpdateUserRequest request);


    void deleteUser(Long id);



    // ============================
    // LOGGED-IN USER APIs
    // ============================

    UserResponse getCurrentUserProfile();


    UserResponse updateCurrentUser(UpdateUserRequest request);

}

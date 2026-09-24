package com.doms.doms.dto;

import com.doms.doms.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String fullName;

    private String email;

    private Role role;
}
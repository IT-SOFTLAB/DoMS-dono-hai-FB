
package com.doms.doms.dto;

import com.doms.doms.entity.Role;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class CreateUserRequest {

    @NotBlank @Size(min = 2, max = 100) private String fullName;

    @NotBlank @Email private String email;

    @NotBlank @Size(min = 8, max = 72) private String password;

    // Ignored by the public API; retained only for source compatibility with older admin clients.
    private Role role;
    @NotBlank @Pattern(regexp = "\\d{10}", message = "Contact number must contain exactly 10 digits") private String contactNumber;
    @NotBlank @Size(max = 100) private String jobTitle;
    @NotBlank @Size(max = 100) private String department;
    @Size(max = 250) private String address;
    @NotNull private java.time.LocalDate startDate;
    @NotNull private java.time.LocalDate endDate;
    @NotNull @Positive private Long orgId;
    @NotNull @Positive private Long planId;
}

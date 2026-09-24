package com.doms.doms.serviceImpl;


import com.doms.doms.dto.CreateUserRequest;
import com.doms.doms.dto.UpdateUserRequest;
import com.doms.doms.dto.UserResponse;
import com.doms.doms.entity.User;
import com.doms.doms.repository.UserRepository;
import com.doms.doms.repository.OrganizationRepository;
import com.doms.doms.repository.PlanRepository;
import com.doms.doms.entity.Role;
import com.doms.doms.exception.ConflictException;
import com.doms.doms.service.UserService;


import lombok.RequiredArgsConstructor;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    private final OrganizationRepository organizationRepository;
    private final PlanRepository planRepository;
    private final com.doms.doms.service.QuotaService quotaService;



    // =====================================
    // ADMIN MODULE
    // =====================================


    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) { return create(request, request.getRole() == null ? Role.ROLE_USER : request.getRole()); }

    @Override @Transactional
    public UserResponse createPublicUser(CreateUserRequest request) { return create(request, Role.ROLE_USER); }

    private UserResponse create(CreateUserRequest request, Role assignedRole) {


        String email = request.getEmail().trim().toLowerCase();
        if(userRepository.existsByEmail(email)){

            throw new ConflictException("Email already exists");

        }


        User user = User.builder()

                .fullName(request.getFullName())

                .email(email)

                .password(
                        passwordEncoder.encode(request.getPassword())
                )

                .role(assignedRole)

                .enabled(true)
                .contactNumber(request.getContactNumber())
                .jobTitle(request.getJobTitle().trim())
                .department(request.getDepartment().trim())
                .address(request.getAddress() == null ? "" : request.getAddress().trim())
                .organization(organizationRepository.findById(request.getOrgId()).orElseGet(() -> {
                    try {
                        organizationRepository.insertWithId(request.getOrgId(), "Organization " + request.getOrgId(), "org-" + request.getOrgId());
                    } catch (Exception ignored) {}
                    return organizationRepository.findById(request.getOrgId()).orElse(null);
                }))
                .plan(planRepository.findById(request.getPlanId()).filter(com.doms.doms.entity.Plan::isActive).orElseThrow(()->new IllegalArgumentException("Plan does not exist or is inactive")))
                .subscriptionStartDate(request.getStartDate())
                .subscriptionEndDate(request.getEndDate())

                .build();

        if (!request.getEndDate().isAfter(request.getStartDate())) throw new IllegalArgumentException("endDate must be later than startDate");
        user.setCurrentPlan(user.getPlan().getSlug().toUpperCase());



        return convertToResponse(
                userRepository.save(user)
        );
    }




    @Override
    public List<UserResponse> getAllUsers() {


        return userRepository.findAll()

                .stream()

                .map(this::convertToResponse)

                .collect(Collectors.toList());

    }




    @Override
    public UserResponse getUserById(Long id) {


        User user = userRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        return convertToResponse(user);

    }





    @Override
    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request) {



        User user = userRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );



        user.setFullName(
                request.getFullName()
        );


        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).filter(found -> !found.getId().equals(id))
                .ifPresent(found -> { throw new IllegalArgumentException("Email already exists"); });
        user.setEmail(email);


        user.setRole(
                request.getRole()
        );


        user.setEnabled(
                request.isEnabled()
        );
        user.setContactNumber(request.getContactNumber());
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setAddress(request.getAddress());
        if (request.getCurrentPlan() != null && !request.getCurrentPlan().isBlank()) {
            user.setCurrentPlan(request.getCurrentPlan().trim().toUpperCase());
        }
        if (request.getDocumentLimit() != null) {
            if (request.getDocumentLimit() < user.getDocumentsUsed()) {
                throw new IllegalArgumentException("Document limit cannot be lower than documents already used");
            }
            user.setDocumentLimit(request.getDocumentLimit());
        }



        return convertToResponse(
                userRepository.save(user)
        );

    }





    @Override
    public void deleteUser(Long id) {


        User user = userRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );



        userRepository.delete(user);

    }







    // =====================================
    // LOGGED-IN USER MODULE
    // =====================================



    @Override
    public UserResponse getCurrentUserProfile() {


        return convertToResponse(
                getCurrentUser()
        );

    }




    @Override
    public UserResponse updateCurrentUser(
            UpdateUserRequest request) {



        User user = getCurrentUser();



        user.setFullName(
                request.getFullName()
        );


        user.setEmail(
                request.getEmail()
        );



        return convertToResponse(
                userRepository.save(user)
        );

    }






    // =====================================
    // HELPER METHODS
    // =====================================


    private User getCurrentUser(){


        Authentication authentication =

                SecurityContextHolder
                        .getContext()
                        .getAuthentication();



        String email =
                authentication.getName();



        return userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

    }





    private UserResponse convertToResponse(User user){


        return UserResponse.builder()

                .id(user.getId())

                .fullName(user.getFullName())

                .email(user.getEmail())

                .role(user.getRole().name())

                .enabled(user.isEnabled())
                .documentLimit(user.getDocumentLimit())
                .documentsUsed(user.getDocumentsUsed())
                .currentPlan(user.getCurrentPlan())
                .contactNumber(user.getContactNumber())
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .address(user.getAddress())
                .orgId(user.getOrganization()==null?null:user.getOrganization().getId())
                .organizationName(user.getOrganization()==null?null:user.getOrganization().getName())
                .planId(user.getPlan()==null?null:user.getPlan().getId())
                .startDate(user.getSubscriptionStartDate())
                .endDate(user.getSubscriptionEndDate())
                .quota(user.getPlan()==null?null:safeQuota(user))

                .build();

    }

    private com.doms.doms.dto.QuotaResponse safeQuota(User user){try{return quotaService.current(user);}catch(IllegalArgumentException ignored){long limit=user.getPlan().getMonthlyUploadLimitBytes();return new com.doms.doms.dto.QuotaResponse(user.getPlan().getName(),limit,0,limit,null,null);}}

}

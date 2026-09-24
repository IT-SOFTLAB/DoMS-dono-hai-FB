package com.doms.doms.serviceImpl;

import com.doms.doms.dto.CreateUserRequest;
import com.doms.doms.entity.*;
import com.doms.doms.repository.*;
import com.doms.doms.service.QuotaService;
import org.junit.jupiter.api.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

class UserServiceImplTest {
 @Test void publicCreationAlwaysAssignsNormalRoleAndHashesPassword(){
  UserRepository users=mock(UserRepository.class);PasswordEncoder encoder=mock(PasswordEncoder.class);OrganizationRepository orgs=mock(OrganizationRepository.class);PlanRepository plans=mock(PlanRepository.class);
  Organization org=Organization.builder().id(2L).name("Acme").slug("acme").build();Plan plan=Plan.builder().id(3L).name("Silver").slug("silver").monthlyUploadLimitBytes(5L*1024*1024*1024).build();
  when(orgs.findById(2L)).thenReturn(Optional.of(org));when(plans.findById(3L)).thenReturn(Optional.of(plan));when(encoder.encode("Password1!")).thenReturn("HASH");when(users.save(any())).thenAnswer(i->i.getArgument(0));
  CreateUserRequest r=request();r.setRole(Role.ROLE_ADMIN);
  var response=new UserServiceImpl(users,encoder,orgs,plans,mock(QuotaService.class)).createPublicUser(r);
  var saved=ArgumentCaptor.forClass(User.class);verify(users).save(saved.capture());assertEquals(Role.ROLE_USER,saved.getValue().getRole());assertEquals("HASH",saved.getValue().getPassword());assertEquals("SILVER",response.getCurrentPlan());
 }
 @Test void invalidDateRangeIsRejected(){CreateUserRequest r=request();r.setEndDate(r.getStartDate());UserRepository users=mock(UserRepository.class);OrganizationRepository orgs=mock(OrganizationRepository.class);PlanRepository plans=mock(PlanRepository.class);when(orgs.findById(2L)).thenReturn(Optional.of(Organization.builder().id(2L).build()));when(plans.findById(3L)).thenReturn(Optional.of(Plan.builder().id(3L).active(true).slug("silver").build()));assertThrows(IllegalArgumentException.class,()->new UserServiceImpl(users,mock(PasswordEncoder.class),orgs,plans,mock(QuotaService.class)).createPublicUser(r));}
 private CreateUserRequest request(){CreateUserRequest r=new CreateUserRequest();r.setFullName("Test User");r.setEmail("test@example.com");r.setPassword("Password1!");r.setContactNumber("9876543210");r.setJobTitle("Analyst");r.setDepartment("Ops");r.setOrgId(2L);r.setPlanId(3L);r.setStartDate(LocalDate.of(2026,9,1));r.setEndDate(LocalDate.of(2027,9,1));return r;}
}

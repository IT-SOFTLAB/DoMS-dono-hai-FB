package com.doms.doms.repository;
import com.doms.doms.entity.SubscriptionRequest;
import com.doms.doms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SubscriptionRequestRepository extends JpaRepository<SubscriptionRequest, Long> {
    List<SubscriptionRequest> findByUserOrderByRequestedAtDesc(User user);
    List<SubscriptionRequest> findAllByOrderByRequestedAtDesc();
    boolean existsByUserAndStatus(User user, String status);
}

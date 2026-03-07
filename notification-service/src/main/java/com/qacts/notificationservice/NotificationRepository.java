package com.qacts.notificationservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerIdOrderByTimestampDesc(Long customerId);

    List<Notification> findByCustomerIdAndReadFalseOrderByTimestampDesc(Long customerId);

    long countByCustomerIdAndReadFalse(Long customerId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.customerId = :customerId AND n.read = false")
    int markAllReadByCustomerId(@Param("customerId") Long customerId);
}

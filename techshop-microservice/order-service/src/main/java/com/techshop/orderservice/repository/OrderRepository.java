package com.techshop.orderservice.repository;

import com.techshop.orderservice.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByUserEmail(String email, Pageable pageable);
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    Page<Order> findByStatusIn(List<Order.OrderStatus> statuses, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id IN :ids")
    List<Order> findByIdInWithItems(@Param("ids") List<Long> ids);

    // ✅ THÊM MỚI: Fetch single order kèm items, tránh LazyInitializationException
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items " +
           "WHERE o.status = :status " +
           "AND o.paymentStatus = :paymentStatus " +
           "AND o.paymentMethod = :paymentMethod " +
           "AND o.createdAt < :expiryTime")
    List<Order> findExpiredOrders(
            @Param("status") Order.OrderStatus status,
            @Param("paymentStatus") Order.PaymentStatus paymentStatus,
            @Param("paymentMethod") Order.PaymentMethod paymentMethod,
            @Param("expiryTime") java.time.LocalDateTime expiryTime
    );
}
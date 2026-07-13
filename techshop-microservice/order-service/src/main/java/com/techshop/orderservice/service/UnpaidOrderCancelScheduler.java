package com.techshop.orderservice.service;

import com.techshop.orderservice.model.Order;
import com.techshop.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UnpaidOrderCancelScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // Chạy định kỳ mỗi 1 phút
    @Scheduled(fixedDelay = 60000)
    public void cancelExpiredUnpaidOrders() {
        log.debug("[Scheduler] Bắt đầu quét đơn hàng VNPay hết hạn thanh toán...");
        
        // Hết hạn sau 15 phút
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        
        try {
            List<Order> expiredOrders = orderRepository.findExpiredOrders(
                    Order.OrderStatus.PENDING,
                    Order.PaymentStatus.UNPAID,
                    Order.PaymentMethod.VNPAY,
                    cutoffTime
            );

            if (!expiredOrders.isEmpty()) {
                log.info("[Scheduler] Tìm thấy {} đơn hàng VNPay chưa thanh toán quá hạn", expiredOrders.size());
                for (Order order : expiredOrders) {
                    try {
                        orderService.cancelOrderSystem(order);
                    } catch (Exception e) {
                        log.error("[Scheduler] Lỗi khi tự động hủy đơn hàng {}: {}", order.getOrderCode(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("[Scheduler] Lỗi khi quét các đơn hàng VNPay hết hạn thanh toán", e);
        }
    }
}

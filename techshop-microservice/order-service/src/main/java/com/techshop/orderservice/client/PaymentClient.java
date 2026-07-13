package com.techshop.orderservice.client;

import com.techshop.orderservice.dto.CreatePaymentRequest;
import com.techshop.orderservice.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @PostMapping("/payments")
    PaymentResponse createPayment(@RequestBody CreatePaymentRequest request);

    @PostMapping("/payments/order/{orderId}/regenerate")
    PaymentResponse regeneratePaymentUrl(
            @org.springframework.web.bind.annotation.PathVariable("orderId") Long orderId,
            @org.springframework.web.bind.annotation.RequestParam("returnUrl") String returnUrl
    );

    @org.springframework.web.bind.annotation.GetMapping("/payments/order/{orderId}")
    PaymentResponse getByOrderId(@org.springframework.web.bind.annotation.PathVariable("orderId") Long orderId);
}

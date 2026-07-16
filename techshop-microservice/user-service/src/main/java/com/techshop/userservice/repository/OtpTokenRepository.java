package com.techshop.userservice.repository;

import com.techshop.userservice.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findByTempToken(String tempToken);

    /** Xóa tất cả OTP đã hết hạn hoặc đã dùng (cleanup job) */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now OR o.used = true")
    void deleteExpiredAndUsed(LocalDateTime now);

    /** Đếm số OTP của email trong 1 phút (rate-limit) */
    @Query("SELECT COUNT(o) FROM OtpToken o WHERE o.email = :email AND o.createdAt > :since")
    long countRecentByEmail(String email, LocalDateTime since);

    /** Đếm số OTP của IP trong 1 phút (rate-limit) */
    @Query("SELECT COUNT(o) FROM OtpToken o WHERE o.ipAddress = :ipAddress AND o.createdAt > :since")
    long countRecentByIp(String ipAddress, LocalDateTime since);
}

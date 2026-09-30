package com.farukfashion.service;

import com.farukfashion.model.LogEntry;
import com.farukfashion.repository.LogEntryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogEntryRepository logRepository;

    public void logLogin(String userId, String email, String phone, boolean success,
                         String action, HttpServletRequest request) {
        LogEntry entry = LogEntry.builder()
                .type(LogEntry.LogType.LOGIN_LOG)
                .userId(userId)
                .userEmail(email)
                .userPhone(phone)
                .action(action)
                .description(success ? "User logged in successfully" : "Login attempt failed")
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .success(success)
                .build();
        logRepository.save(entry);
    }

    public void logPurchase(String userId, String email, String orderId, String orderNumber,
                            double amount, String action, Map<String, Object> metadata) {
        LogEntry entry = LogEntry.builder()
                .type(LogEntry.LogType.PURCHASE_LOG)
                .userId(userId)
                .userEmail(email)
                .orderId(orderId)
                .orderNumber(orderNumber)
                .amount(amount)
                .action(action)
                .description("Purchase: " + action)
                .metadata(metadata)
                .success(true)
                .build();
        logRepository.save(entry);
    }

    public void logReturnRefund(String userId, String email, String orderId, String orderNumber,
                                double amount, String action, String reason) {
        LogEntry entry = LogEntry.builder()
                .type(LogEntry.LogType.RETURN_REFUND_LOG)
                .userId(userId)
                .userEmail(email)
                .orderId(orderId)
                .orderNumber(orderNumber)
                .amount(amount)
                .action(action)
                .description(reason)
                .success(true)
                .build();
        logRepository.save(entry);
    }

    public void logInventory(String productId, String action, String description, Map<String, Object> meta) {
        LogEntry entry = LogEntry.builder()
                .type(LogEntry.LogType.INVENTORY_LOG)
                .productId(productId)
                .action(action)
                .description(description)
                .metadata(meta)
                .success(true)
                .build();
        logRepository.save(entry);
    }

    public Page<LogEntry> getLogsByType(LogEntry.LogType type, Pageable pageable) {
        return logRepository.findByType(type, pageable);
    }

    public Page<LogEntry> getUserLogs(String userId, LogEntry.LogType type, Pageable pageable) {
        return logRepository.findByUserIdAndType(userId, type, pageable);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

package com.farukfashion.controller;

import com.farukfashion.model.LogEntry;
import com.farukfashion.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LogController {

    private final LogService logService;

    @GetMapping("/login")
    public ResponseEntity<Page<LogEntry>> loginLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(logService.getLogsByType(LogEntry.LogType.LOGIN_LOG, PageRequest.of(page, size)));
    }

    @GetMapping("/purchase")
    public ResponseEntity<Page<LogEntry>> purchaseLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(logService.getLogsByType(LogEntry.LogType.PURCHASE_LOG, PageRequest.of(page, size)));
    }

    @GetMapping("/returns")
    public ResponseEntity<Page<LogEntry>> returnLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(logService.getLogsByType(LogEntry.LogType.RETURN_REFUND_LOG, PageRequest.of(page, size)));
    }

    @GetMapping("/inventory")
    public ResponseEntity<Page<LogEntry>> inventoryLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(logService.getLogsByType(LogEntry.LogType.INVENTORY_LOG, PageRequest.of(page, size)));
    }
}

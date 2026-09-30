package com.farukfashion.repository;

import com.farukfashion.model.LogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogEntryRepository extends MongoRepository<LogEntry, String> {
    Page<LogEntry> findByType(LogEntry.LogType type, Pageable pageable);
    Page<LogEntry> findByUserIdAndType(String userId, LogEntry.LogType type, Pageable pageable);
    Page<LogEntry> findByOrderId(String orderId, Pageable pageable);
}

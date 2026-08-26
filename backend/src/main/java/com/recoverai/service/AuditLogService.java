package com.recoverai.service;

import com.recoverai.dto.AuditLogDto;
import com.recoverai.dto.PageResponse;
import com.recoverai.entity.AuditLog;
import com.recoverai.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getAuditLogs(String search, String actor, String event, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actor != null && !actor.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("actor")), actor.trim().toLowerCase()));
            }
            if (event != null && !event.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("eventType")), event.trim().toLowerCase()));
            }
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate reasonMatch = cb.like(cb.lower(root.get("reason")), term);
                Predicate decisionMatch = cb.like(cb.lower(root.get("decision")), term);
                Predicate actionMatch = cb.like(cb.lower(root.get("action")), term);
                Predicate resultMatch = cb.like(cb.lower(root.get("result")), term);
                predicates.add(cb.or(reasonMatch, decisionMatch, actionMatch, resultMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        List<AuditLogDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<AuditLogDto>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private AuditLogDto mapToDto(AuditLog al) {
        return AuditLogDto.builder()
                .id(al.getId())
                .transactionId(al.getTransaction() != null ? al.getTransaction().getTransactionId() : null)
                .eventType(al.getEventType())
                .actor(al.getActor())
                .decision(al.getDecision())
                .action(al.getAction())
                .result(al.getResult())
                .reason(al.getReason())
                .timestamp(al.getTimestamp())
                .build();
    }
}

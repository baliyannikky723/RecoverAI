package com.recoverai.service;

import com.recoverai.dto.PageResponse;
import com.recoverai.dto.RecoveryActionDto;
import com.recoverai.entity.RecoveryAction;
import com.recoverai.entity.enums.RecoveryActionStatus;
import com.recoverai.exception.ResourceNotFoundException;
import com.recoverai.repository.RecoveryActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecoveryService {

    private final RecoveryActionRepository recoveryActionRepository;

    @Transactional(readOnly = true)
    public PageResponse<RecoveryActionDto> getRecoveryActions(RecoveryActionStatus status, Pageable pageable) {
        Page<RecoveryAction> page;
        if (status != null) {
            page = recoveryActionRepository.findByStatus(status, pageable);
        } else {
            page = recoveryActionRepository.findAll(pageable);
        }

        List<RecoveryActionDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<RecoveryActionDto>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public RecoveryActionDto getRecoveryActionById(String id) {
        RecoveryAction action = recoveryActionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recovery action not found with id: " + id));

        return mapToDto(action);
    }

    private RecoveryActionDto mapToDto(RecoveryAction ra) {
        return RecoveryActionDto.builder()
                .id(ra.getId())
                .transactionId(ra.getTransaction().getTransactionId())
                .customerName(ra.getTransaction().getCustomer().getName())
                .amount(ra.getTransaction().getAmount())
                .currency(ra.getTransaction().getCurrency())
                .actionType(ra.getActionType())
                .confidence(ra.getConfidence())
                .expectedRecoveryAmount(ra.getExpectedRecoveryAmount())
                .status(ra.getStatus())
                .reason(ra.getReason())
                .createdAt(ra.getCreatedAt())
                .executedAt(ra.getExecutedAt())
                .build();
    }
}

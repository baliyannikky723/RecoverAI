package com.recoverai.controller;

import com.recoverai.dto.CustomerDetailDto;
import com.recoverai.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getCustomerById(@PathVariable String id) {
        CustomerDetailDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }
}

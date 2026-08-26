package com.recoverai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnPaginatedTransactions() throws Exception {
        mockMvc.perform(get("/api/transactions?page=0&size=10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1000)));
    }

    @Test
    void shouldFilterTransactionsByStatus() throws Exception {
        mockMvc.perform(get("/api/transactions?status=RECOVERED&size=5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.content[0].status").value("RECOVERED"));
    }

    @Test
    void shouldFilterTransactionsByRiskLevel() throws Exception {
        mockMvc.perform(get("/api/transactions?risk=HIGH&size=5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.content[0].riskLevel").value("HIGH"));
    }

    @Test
    void shouldReturnTransactionDetailsById() throws Exception {
        mockMvc.perform(get("/api/transactions/TXN-10001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN-10001"))
                .andExpect(jsonPath("$.customer", notNullValue()))
                .andExpect(jsonPath("$.paymentAttempts", notNullValue()))
                .andExpect(jsonPath("$.recoveryActions", notNullValue()));
    }

    @Test
    void shouldReturn404ForNonExistentTransaction() throws Exception {
        mockMvc.perform(get("/api/transactions/TXN-NON-EXISTENT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}

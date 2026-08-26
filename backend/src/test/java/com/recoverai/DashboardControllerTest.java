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
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenueAtRisk", notNullValue()))
                .andExpect(jsonPath("$.revenueRecovered", notNullValue()))
                .andExpect(jsonPath("$.recoveryRate", notNullValue()))
                .andExpect(jsonPath("$.transactionsAtRisk", notNullValue()))
                .andExpect(jsonPath("$.revenueOverview", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.failureReasonDistribution", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.highPriorityTransactions", hasSize(lessThanOrEqualTo(4))));
    }
}

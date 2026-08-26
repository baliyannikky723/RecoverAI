package com.recoverai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnAnalyticsSummary() throws Exception {
        mockMvc.perform(get("/api/analytics/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revenueAtRisk", notNullValue()))
                .andExpect(jsonPath("$.revenueRecovered", notNullValue()))
                .andExpect(jsonPath("$.recoveryRate", notNullValue()))
                .andExpect(jsonPath("$.totalInvoices", notNullValue()));
    }

    @Test
    void shouldReturnRecoveryComparison() throws Exception {
        mockMvc.perform(get("/api/analytics/recovery-comparison")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baselineRevenue").value(890000))
                .andExpect(jsonPath("$.improvementPercentage").value(31.5))
                .andExpect(jsonPath("$.baselineRate").value(48.4))
                .andExpect(jsonPath("$.recoverAiRate").value(63.6));
    }
}

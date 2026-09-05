package com.recoverai.service;

import jakarta.mail.internet.MimeMessage;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Data
    @Builder
    public static class EmailDispatchResult {
        private boolean success;
        private boolean isLiveSent;
        private String recipient;
        private String subject;
        private String provider;
        private String message;
        private LocalDateTime timestamp;
    }

    public EmailDispatchResult sendDemoConfirmation(String recipientEmail, String name, String company) {
        String displayName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Merchant Partner";
        String displayCompany = (company != null && !company.trim().isEmpty()) ? company.trim() : "Your Team";
        String subject = "RecoverAI — Custom Demo & Revenue Recovery Assessment Confirmation";

        String htmlContent = buildDemoEmailHtml(displayName, displayCompany, recipientEmail);

        boolean hasSenderCredentials = senderEmail != null && !senderEmail.trim().isEmpty() && !senderEmail.contains("your_email");

        if (hasSenderCredentials) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail, "RecoverAI Team");
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("EmailService: Live email successfully sent to {} via configured SMTP server.", recipientEmail);

                return EmailDispatchResult.builder()
                        .success(true)
                        .isLiveSent(true)
                        .recipient(recipientEmail)
                        .subject(subject)
                        .provider("SMTP_LIVE")
                        .message("Live confirmation email successfully delivered to " + recipientEmail)
                        .timestamp(LocalDateTime.now())
                        .build();
            } catch (Exception e) {
                log.warn("EmailService: Failed to dispatch live email via SMTP (Error: {}). Processing in demo dispatch fallback mode.", e.getMessage());
            }
        } else {
            log.info("EmailService: SMTP credentials not set in SPRING_MAIL_USERNAME. Operating in simulated live-log delivery mode for {}.", recipientEmail);
        }

        // Demo fallback result when SMTP is not configured or in sandbox
        return EmailDispatchResult.builder()
                .success(true)
                .isLiveSent(false)
                .recipient(recipientEmail)
                .subject(subject)
                .provider(hasSenderCredentials ? "SMTP_FALLBACK" : "SANDBOX_MOCK_DISPATCH")
                .message("Custom demo request registered for " + recipientEmail + ". Demo packet prepared.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String buildDemoEmailHtml(String name, String company, String email) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; color: #f8fafc;'>"
                + "<div style='max-width: 600px; margin: 30px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;'>"
                + "  <div style='background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 24px; text-align: center;'>"
                + "    <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;'>RecoverAI</h1>"
                + "    <p style='margin: 6px 0 0 0; color: #e0e7ff; font-size: 13px;'>Autonomous Revenue Recovery Decision Engine</p>"
                + "  </div>"
                + "  <div style='padding: 30px 24px;'>"
                + "    <h2 style='color: #ffffff; font-size: 18px; margin-top: 0;'>Hello " + name + ",</h2>"
                + "    <p style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>"
                + "      Thank you for requesting a custom demo for <strong>" + displayCompanySafe(company) + "</strong>. We have received your submission for <strong>" + email + "</strong>."
                + "    </p>"
                + "    <div style='background-color: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; margin: 24px 0;'>"
                + "      <h3 style='color: #818cf8; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;'>What Happens Next:</h3>"
                + "      <ul style='color: #cbd5e1; font-size: 13px; line-height: 1.7; margin: 0; padding-left: 20px;'>"
                + "        <li><strong>Recovery Audit:</strong> Our payment routing engine analyzes your historical payment decline patterns.</li>"
                + "        <li><strong>AI Model Calibration:</strong> Sandbox testing with simulated customer LTV and gateway error codes.</li>"
                + "        <li><strong>Live Integration Call:</strong> A dunning architect will contact you within 24 hours.</li>"
                + "      </ul>"
                + "    </div>"
                + "    <p style='color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 24px;'>"
                + "      In the meantime, you can explore the RecoverAI live dashboard and test real-time webhook scenarios directly."
                + "    </p>"
                + "  </div>"
                + "  <div style='background-color: #020617; border-top: 1px solid #1e293b; padding: 18px 24px; text-align: center; color: #64748b; font-size: 11px;'>"
                + "    © 2026 RecoverAI Technologies, Inc. • sales@recoverai.com • All rights reserved."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String displayCompanySafe(String company) {
        return (company != null && !company.trim().isEmpty()) ? company : "your organization";
    }
}

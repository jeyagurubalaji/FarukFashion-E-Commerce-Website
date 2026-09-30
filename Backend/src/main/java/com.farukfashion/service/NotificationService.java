package com.farukfashion.service;

import com.farukfashion.model.Order;
import com.farukfashion.model.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.support-email}")
    private String supportEmail;

    @Value("${app.seller-email}")
    private String sellerEmail;

    @Value("${app.support-phone}")
    private String supportPhone;

    @Value("${app.name:Faruk Fashion}")
    private String appName;

    @Value("${app.notifications.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${app.notifications.sms-enabled:false}")
    private boolean smsEnabled;

    @Value("${app.notifications.whatsapp-enabled:false}")
    private boolean whatsappEnabled;

    @Value("${twilio.account-sid:}")
    private String twilioSid;

    @Value("${twilio.auth-token:}")
    private String twilioToken;

    @Value("${twilio.whatsapp-from:}")
    private String whatsappFrom;

    @Value("${twilio.sms-from:}")
    private String smsFrom;

    @Async
    public void sendOrderConfirmation(Order order, User buyer) {
        String buyerMsg = buildBuyerOrderMessage(order);
        String sellerMsg = buildSellerOrderMessage(order);

        if (emailEnabled) {
            sendEmail(order.getCustomerEmail(),
                    "Order Confirmed - " + order.getOrderNumber() + " | Faruk Fashion",
                    buyerMsg);
            sendEmail(sellerEmail,
                    "New Order Received - " + order.getOrderNumber(),
                    sellerMsg);
        }

        if (whatsappEnabled) {
            sendWhatsApp(order.getCustomerPhone(), buyerMsg);
            sendWhatsApp(supportPhone, sellerMsg);
        }

        if (smsEnabled) {
            sendSms(order.getCustomerPhone(),
                    "Faruk Fashion: Your order " + order.getOrderNumber() +
                            " is confirmed. Total: ₹" + order.getTotalAmount() +
                            ". Track on our app/website. Thank you!");
            sendSms(supportPhone,
                    "New Order " + order.getOrderNumber() + " from " +
                            order.getCustomerName() + " - ₹" + order.getTotalAmount());
        }

        log.info("Order confirmation notifications sent for {} (email={}, sms={}, whatsapp={})",
                order.getOrderNumber(), emailEnabled, smsEnabled, whatsappEnabled);
    }

    @Async
    public void sendOrderStatusUpdate(Order order, String statusMessage) {
        String msg = "Faruk Fashion Update: Order " + order.getOrderNumber() + " - " + statusMessage;
        if (emailEnabled) {
            sendEmail(order.getCustomerEmail(), "Order Update - " + order.getOrderNumber(), msg);
        }
        if (whatsappEnabled) {
            sendWhatsApp(order.getCustomerPhone(), msg);
        }
        if (smsEnabled) {
            sendSms(order.getCustomerPhone(), msg);
        }
    }

    @Async
    public void sendReturnConfirmation(Order order) {
        String msg = "Faruk Fashion: Return request for order " + order.getOrderNumber() +
                " has been received. Our team will contact you shortly. Support: " + supportPhone;
        if (emailEnabled) {
            sendEmail(order.getCustomerEmail(), "Return Request Received", msg);
            sendEmail(sellerEmail, "Return Request - " + order.getOrderNumber(), msg);
        }
        if (whatsappEnabled) {
            sendWhatsApp(order.getCustomerPhone(), msg);
            sendWhatsApp(supportPhone, "Return Request: " + order.getOrderNumber());
        }
        if (smsEnabled) {
            sendSms(order.getCustomerPhone(), msg);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Skip email: empty recipient");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(supportEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(wrapHtml(body), true);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void sendWhatsApp(String to, String body) {
        if (!whatsappEnabled) {
            return;
        }
        if (twilioSid == null || twilioSid.isBlank() || twilioSid.startsWith("your_")) {
            log.info("[MOCK WhatsApp] To: {} | Msg: {}", to, body.substring(0, Math.min(80, body.length())));
            return;
        }
        try {
            com.twilio.Twilio.init(twilioSid, twilioToken);
            String toNumber = to.startsWith("whatsapp:") ? to : "whatsapp:" + normalizePhone(to);
            String from = whatsappFrom.startsWith("whatsapp:") ? whatsappFrom : "whatsapp:" + whatsappFrom;
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber(toNumber),
                    new com.twilio.type.PhoneNumber(from),
                    body
            ).create();
            log.debug("WhatsApp sent to {}", to);
        } catch (Exception e) {
            log.error("WhatsApp failed to {}: {}", to, e.getMessage());
        }
    }

    private void sendSms(String to, String body) {
        if (!smsEnabled) {
            return;
        }
        if (twilioSid == null || twilioSid.isBlank() || twilioSid.startsWith("your_")) {
            log.info("[MOCK SMS] To: {} | Msg: {}", to, body);
            return;
        }
        try {
            com.twilio.Twilio.init(twilioSid, twilioToken);
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber(normalizePhone(to)),
                    new com.twilio.type.PhoneNumber(smsFrom),
                    body
            ).create();
            log.debug("SMS sent to {}", to);
        } catch (Exception e) {
            log.error("SMS failed to {}: {}", to, e.getMessage());
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        phone = phone.replaceAll("[^0-9+]", "");
        if (!phone.startsWith("+")) {
            phone = "+91" + phone;
        }
        return phone;
    }

    private String buildBuyerOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Dear ").append(order.getCustomerName()).append(",\n\n");
        sb.append("Thank you for shopping with Faruk Fashion!\n\n");
        sb.append("Order Number: ").append(order.getOrderNumber()).append("\n");
        sb.append("Total Amount: ₹").append(order.getTotalAmount()).append("\n");
        sb.append("Payment Status: ").append(order.getPaymentStatus()).append("\n\n");
        sb.append("Items:\n");
        order.getItems().forEach(i ->
                sb.append("- ").append(i.getProductName())
                        .append(" x").append(i.getQuantity())
                        .append(" = ₹").append(i.getTotalPrice()).append("\n"));
        sb.append("\nWe will notify you once your order is shipped.\n");
        sb.append("For support: ").append(supportPhone).append("\n\n");
        sb.append("Style That Speaks\nFaruk Fashion");
        return sb.toString();
    }

    private String buildSellerOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("NEW ORDER RECEIVED\n\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(order.getCustomerName()).append("\n");
        sb.append("Phone: ").append(order.getCustomerPhone()).append("\n");
        sb.append("Email: ").append(order.getCustomerEmail()).append("\n");
        sb.append("Total: ₹").append(order.getTotalAmount()).append("\n");
        sb.append("Payment: ").append(order.getPaymentMethod()).append(" - ").append(order.getPaymentStatus()).append("\n\n");
        sb.append("Items:\n");
        order.getItems().forEach(i ->
                sb.append("- ").append(i.getProductName())
                        .append(" x").append(i.getQuantity()).append("\n"));
        if (order.getShippingAddress() != null) {
            sb.append("\nShipping Address:\n")
                    .append(order.getShippingAddress().getAddressLine1()).append(", ")
                    .append(order.getShippingAddress().getCity()).append(" - ")
                    .append(order.getShippingAddress().getPincode());
        }
        return sb.toString();
    }

    private String wrapHtml(String text) {
        return "<html><body style='font-family: Georgia, serif; color: #1a1a1a; background:#f9f5f0; padding:20px;'>"
                + "<div style='max-width:600px;margin:auto;background:white;padding:30px;border:1px solid #c9a227;'>"
                + "<h2 style='color:#c9a227;text-align:center;'>FARUK FASHION</h2>"
                + "<p style='color:#666;text-align:center;font-style:italic;'>Style That Speaks</p><hr style='border-color:#c9a227;'>"
                + "<pre style='white-space:pre-wrap;font-family:Georgia,serif;'>" + text + "</pre>"
                + "<hr style='border-color:#c9a227;'>"
                + "<p style='text-align:center;font-size:12px;color:#888;'>35, Kamarajar Street, Thenkarai, Periyakulam-625 601<br>"
                + "WhatsApp: +91 93442 82751</p></div></body></html>";
    }
}
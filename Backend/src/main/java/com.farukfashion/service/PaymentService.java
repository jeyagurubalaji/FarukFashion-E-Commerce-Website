package com.farukfashion.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public Map<String, String> createRazorpayOrder(BigDecimal amount, String receipt) {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()
                || keyId.contains("xxxx") || keySecret.contains("your_")) {
            throw new RuntimeException("Razorpay keys not configured. Set razorpay.key-id and key-secret in application.yaml");
        }

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            int paise = amount.multiply(BigDecimal.valueOf(100)).intValue();
            if (paise < 100) {
                throw new RuntimeException("Amount must be at least ₹1");
            }

            JSONObject options = new JSONObject();
            options.put("amount", paise);
            options.put("currency", "INR");
            options.put("receipt", receipt.length() > 40 ? receipt.substring(0, 40) : receipt);
            options.put("payment_capture", 1);

            Order order = client.orders.create(options);
            JSONObject json = order.toJson();

            Map<String, String> result = new HashMap<>();
            result.put("razorpayOrderId", json.getString("id"));
            result.put("amount", String.valueOf(json.get("amount")));
            result.put("currency", json.optString("currency", "INR"));
            result.put("keyId", keyId);
            result.put("mock", "false");
            return result;
        } catch (RazorpayException e) {
            log.error("Razorpay create order failed: {}", e.getMessage());
            throw new RuntimeException("Payment gateway error: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String expected = hmacSha256(payload, keySecret);
            return expected.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Payment verification error: {}", e.getMessage());
            return false;
        }
    }

    private String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
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
import java.util.HexFormat;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank()
                && !keyId.contains("xxxx")
                && keySecret != null && !keySecret.isBlank()
                && !keySecret.contains("your_");
    }

    public String getKeyId() {
        return keyId;
    }

    /** amountInRupees → Razorpay order id */
    public String createRazorpayOrder(BigDecimal amountInRupees, String receipt) throws RazorpayException {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        int paise = amountInRupees.multiply(BigDecimal.valueOf(100)).intValue();

        JSONObject options = new JSONObject();
        options.put("amount", paise);
        options.put("currency", "INR");
        options.put("receipt", receipt);
        options.put("payment_capture", 1);

        Order order = client.orders.create(options);
        return order.get("id");
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            return expected.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Signature verify failed", e);
            return false;
        }
    }
}
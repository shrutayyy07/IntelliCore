package com.intellicore.service;

import com.intellicore.model.User;
import com.intellicore.security.JwtService;
import com.intellicore.storage.FlatFileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int OTP_EXPIRY_MINUTES = 10;

    @Autowired private FlatFileStorageService storage;
    @Autowired private JwtService jwtService;
    @Autowired private LogService logService;

    // In-memory OTP store (phone -> otp + expiry)
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    public record OtpRecord(String otp, LocalDateTime expiry) {}

    /**
     * Generates and "sends" OTP (logs it in dev mode — integrate SMS API in prod)
     */
    public String sendOtp(String phone) {
        String otp = generateOtp();
        otpStore.put(phone, new OtpRecord(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));

        // TODO: Integrate Twilio/MSG91 for real SMS in production
        logger.info("[OTP] Phone: {} | OTP: {} (DEV MODE - shown in logs)", phone, otp);
        logService.info("OTP generated for " + maskPhone(phone) + " [DEV: " + otp + "]");

        return otp; // Return in response for development; remove in production
    }

    public String verifyOtp(String phone, String otp, String name) {
        OtpRecord record = otpStore.get(phone);
        if (record == null) throw new RuntimeException("OTP not found. Please request a new OTP.");
        if (LocalDateTime.now().isAfter(record.expiry())) {
            otpStore.remove(phone);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!record.otp().equals(otp)) throw new RuntimeException("Invalid OTP.");

        otpStore.remove(phone);

        User user = storage.getUserByPhone(phone).orElseGet(() -> {
            User u = new User();
            u.setPhone(phone);
            u.setName(name != null ? name : "User");
            u.setRole("USER");
            return storage.saveUser(u);
        });

        if (name != null && !name.isBlank()) {
            user.setName(name);
            storage.saveUser(user);
        }

        logService.info("User authenticated: " + maskPhone(phone));
        return jwtService.generateToken(user);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return phone.substring(0, phone.length() - 4).replaceAll(".", "*") + phone.substring(phone.length() - 4);
    }
}

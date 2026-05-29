package com.intellicore.controller;

import com.intellicore.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }
        try {
            String otp = authService.sendOtp(phone);
            // In production, remove 'otp' from response and send via SMS
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully",
                "otp", otp // DEV ONLY — remove in production
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String otp = body.get("otp");
        String name = body.get("name");

        if (phone == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone and OTP are required"));
        }
        try {
            String token = authService.verifyOtp(phone, otp, name);
            return ResponseEntity.ok(Map.of("token", token, "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

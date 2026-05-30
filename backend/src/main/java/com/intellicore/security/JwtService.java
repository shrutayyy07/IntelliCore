package com.intellicore.security;

import com.intellicore.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private SecretKey key() {
        // Key must be at least 256 bits (32 chars) for HS256
        String padded = String.format("%-32s", secret).substring(0, Math.max(32, secret.length()));
        return Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        // jjwt 0.12.x API
        return Jwts.builder()
                .subject(user.getId())
                .claim("phone", user.getPhone())
                .claim("name", user.getName())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

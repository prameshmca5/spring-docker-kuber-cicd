package com.qacts.apigateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String secret = "C9XSpVNTfdsK3ZOZieL8SSVRslmmxFyxVpO1maa0Vo8=";

    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }

    public Claims getClaims(final String token) {
        return Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody();
    }

    public Long getUserId(final String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String getRole(final String token) {
        return getClaims(token).get("role", String.class);
    }

    private Key getSignKey() {
        log.info("Generating sign key. Secret length: {}, Prefix: {}", secret.length(), secret.substring(0, 5));
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

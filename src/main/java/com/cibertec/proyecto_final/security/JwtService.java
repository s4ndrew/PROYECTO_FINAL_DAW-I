package com.cibertec.proyecto_final.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Genera y valida los tokens JWT del login (RF-01 a RF-04).
 * Adaptación del esqueleto de "semana5" del profesor: se mantiene la misma
 * idea (Jwts.builder()/Jwts.parser()) pero con la API de jjwt 0.12.x.
 */
@Component
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generarToken(String usuario, Long id, String rol) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);
        return Jwts.builder()
                .subject(usuario)
                .claim("id", id)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(secretKey)
                .compact();
    }

    public String extraerUsuario(String token) {
        return parseClaims(token).getSubject();
    }

    // RNF-02: el rol viaja en el propio token para no tener que ir a BD en cada request.
    public String extraerRol(String token) {
        return parseClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

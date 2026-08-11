package com.cibertec.proyecto_final.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración temporal mientras se construyen los catálogos (RF-05 a RF-12).
 * Deja todos los endpoints abiertos para poder probarlos desde Postman sin
 * autenticación. Cuando se implemente el login (RF-01/RF-02) con JWT y
 * BCryptPasswordEncoder, esta clase se reemplaza para exigir el token
 * "Authorization: Bearer <token>" en las rutas protegidas y permitAll()
 * solo en POST /usuarios/login.
 */
@Configuration
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}

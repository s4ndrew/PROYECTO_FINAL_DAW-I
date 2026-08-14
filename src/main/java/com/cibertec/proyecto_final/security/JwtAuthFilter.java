package com.cibertec.proyecto_final.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * RNF-01: autentica cada request revisando "Authorization: Bearer <token>".
 * Si el token es válido, deja al usuario autenticado en el SecurityContext
 * para el resto del filtro de Spring Security; si no hay token o es
 * inválido, simplemente sigue sin autenticar (WebSecurityConfig es quien
 * decide si esa ruta exige estar autenticado).
 *
 * OJO: a propósito NO lleva @Component. Si lo tuviera, Spring Boot lo
 * registraría automáticamente como filtro de servlet (corriendo una vez
 * ahí) Y nosotros lo volveríamos a registrar a mano en el
 * SecurityFilterChain, ejecutándolo dos veces por request. Por eso se
 * instancia directo en WebSecurityConfig.
 */
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.esTokenValido(token)) {
                String usuario = jwtService.extraerUsuario(token);
                String rol = jwtService.extraerRol(token);
                // RNF-02: el rol del token se traduce en una authority "ROLE_x" para
                // que hasRole()/@PreAuthorize puedan filtrar por rol en cada endpoint.
                List<GrantedAuthority> authorities = rol != null
                        ? List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                        : Collections.emptyList();
                var authentication = new UsernamePasswordAuthenticationToken(usuario, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}

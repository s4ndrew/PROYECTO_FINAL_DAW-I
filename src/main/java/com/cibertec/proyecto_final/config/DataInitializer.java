package com.cibertec.proyecto_final.config;

import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea un usuario administrador la primera vez que se levanta la app (si la
 * tabla "usuarios" está vacía). Como ahora TODAS las rutas exigen JWT salvo
 * el login, esto resuelve el problema de "no puedo crear un usuario sin
 * estar logueado, ni loguearme sin un usuario creado". Ver README.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final IUsuarioRepository iUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (iUsuarioRepository.count() == 0) {
            UsuarioEntity admin = UsuarioEntity.builder()
                    .usuario("admin")
                    .password(passwordEncoder.encode("Admin123!"))
                    .nombres("Administrador")
                    .apellidos("Sistema")
                    .rol("ADMIN")
                    .activo(true)
                    .build();
            iUsuarioRepository.save(admin);
            log.info("Usuario administrador creado -> usuario: admin | password: Admin123!");

            // RNF-02: usuario de prueba para validar las restricciones por rol (operador
            // de caja no puede gestionar catálogos ni usuarios, ver README).
            UsuarioEntity operador = UsuarioEntity.builder()
                    .usuario("operador")
                    .password(passwordEncoder.encode("Operador123!"))
                    .nombres("Operador")
                    .apellidos("Caja")
                    .rol("OPERADOR")
                    .activo(true)
                    .build();
            iUsuarioRepository.save(operador);
            log.info("Usuario operador creado -> usuario: operador | password: Operador123!");
        }
    }
}

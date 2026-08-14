package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "usuarios")
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    // RF-01: nunca se guarda en texto plano, se cifra con BCryptPasswordEncoder antes del save.
    @Column(nullable = false)
    private String password;

    private String nombres;
    private String apellidos;
    private String rol;
    private boolean activo;
}

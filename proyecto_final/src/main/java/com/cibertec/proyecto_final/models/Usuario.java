package com.cibertec.proyecto_final.models;

import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Table(name = "usuario")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Usuario {
    private Long id;
    private String usuario;
    private String nombres;
    private String apellidos;
    private String rol;
    private boolean activo;
}

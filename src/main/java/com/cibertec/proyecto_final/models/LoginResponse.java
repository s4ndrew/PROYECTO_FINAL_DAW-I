package com.cibertec.proyecto_final.models;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private Long id;
    private String usuario;
    private String nombres;
    private String apellidos;
    private String rol;
}

package com.cibertec.proyecto_final.models;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Socio {
    private Long id;
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellidos;
    @NotBlank
    private String accion;
    @NotBlank
    private String etapa;
    @NotNull
    private LocalDate fechaNacimiento;
}

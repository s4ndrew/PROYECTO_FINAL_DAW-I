package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Puesto {
    private Long id;

    @NotBlank(message = "El número de puesto es obligatorio")
    @Size(max = 20, message = "El número no puede superar los 20 caracteres")
    private String numero;

    // Opcional: RF-10 dice que el socio se asocia "cuando corresponda"
    private Socio socio;

    @NotNull(message = "El giro es obligatorio")
    private Giro giro;

    @Size(max = 150, message = "El nombre del inquilino no puede superar los 150 caracteres")
    private String inquilinoNombre;

    @Size(max = 20, message = "El documento del inquilino no puede superar los 20 caracteres")
    private String inquilinoDocumento;

    private LocalDate vigenciaInicio;

    private LocalDate vigenciaFin;
}
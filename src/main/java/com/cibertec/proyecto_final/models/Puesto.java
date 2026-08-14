package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Puesto {
    private Long id;

    @NotBlank(message = "El número de puesto es obligatorio")
    @Size(max = 20, message = "El número de puesto no puede superar los 20 caracteres")
    private String numero;

    // Solo el id del socio/giro, no el objeto completo: así el frontend
    // manda las referencias que el usuario elige en un <select>, igual
    // que describe RF-10 ("seleccionar ambas referencias existentes").
    // Sin @NotNull porque el socio es opcional ("cuando corresponda").
    @Positive(message = "El id del socio debe ser un valor positivo")
    private Long socioId;

    @NotNull(message = "El giro es obligatorio")
    @Positive(message = "El id del giro debe ser un valor positivo")
    private Long giroId;

    @Size(max = 100, message = "El nombre del inquilino no puede superar los 100 caracteres")
    private String inquilinoNombre;

    @Size(max = 20, message = "El documento del inquilino no puede superar los 20 caracteres")
    private String inquilinoDocumento;

    private LocalDate vigenciaInicio;
    private LocalDate vigenciaFin;
}

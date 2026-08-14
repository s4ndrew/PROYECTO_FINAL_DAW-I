package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

// RF-25: ingreso que no está ligado a un socio ni a un puesto (donaciones, aportes de terceros, etc.).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngresoExternoRequest {

    @NotBlank(message = "El depositante es obligatorio")
    private String depositante;

    private String categoria;

    private String concepto;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;
}

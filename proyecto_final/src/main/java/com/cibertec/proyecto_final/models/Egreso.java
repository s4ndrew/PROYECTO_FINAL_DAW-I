package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Egreso {

    private Long id;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipo;

    private Long correlativo;

    @NotBlank(message = "El proveedor es obligatorio")
    private String proveedor;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El subtotal es obligatorio")
    @Positive(message = "El subtotal debe ser mayor a 0")
    private BigDecimal subtotal;

    private BigDecimal igv;

    @NotNull(message = "El total es obligatorio")
    @Positive(message = "El total debe ser mayor a 0")
    private BigDecimal total;

    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    private String categoria;
    private Long bancoId;
    private Long usuarioId;
}
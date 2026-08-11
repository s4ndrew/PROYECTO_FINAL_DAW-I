package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Recibo {
    private Long id;

    @NotBlank(message = "El tipo de recibo es obligatorio")
    @Pattern(regexp = "^(INGRESO|BANCO)$", message = "El tipo debe ser INGRESO o BANCO")
    private String tipo;

    // Lo asigna el sistema (correlativo), no lo envía el cliente
    private Long correlativo;

    private LocalDateTime fecha;

    @NotNull(message = "El monto es obligatorio")
    private BigDecimal monto;

    private Socio socio;

    private Puesto puesto;

    private Banco banco;

    @NotNull(message = "El usuario es obligatorio")
    private Usuario usuario;

    private String concepto;

    private String categoria;

    private String depositante;

    private LocalDate fechaDeposito;
}
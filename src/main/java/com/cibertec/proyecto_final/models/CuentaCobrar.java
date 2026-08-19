package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CuentaCobrar {
    private Long id;

    @NotNull(message = "El servicio es obligatorio")
    private Servicio servicio;

    private Socio socio;

    private Puesto puesto;

    @NotBlank(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "El periodo debe tener formato YYYY-MM")
    private String periodo;

    private BigDecimal lecturaInicial;

    private BigDecimal lecturaFinal;

    @NotNull(message = "El monto es obligatorio")
    private BigDecimal monto;

    private String estado;

    private LocalDateTime fechaGeneracion;
}
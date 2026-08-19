package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarConsumoRequest {

    @NotNull(message = "El servicio es obligatorio")
    private Long servicioId;

    @NotNull(message = "El puesto es obligatorio")
    private Long puestoId;

    @NotNull(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "El periodo debe tener el formato AAAA-MM")
    private String periodo;

    @NotNull(message = "La lectura inicial es obligatoria")
    @PositiveOrZero(message = "La lectura inicial no puede ser negativa")
    private BigDecimal lecturaInicial;

    @NotNull(message = "La lectura final es obligatoria")
    @PositiveOrZero(message = "La lectura final no puede ser negativa")
    private BigDecimal lecturaFinal;
}

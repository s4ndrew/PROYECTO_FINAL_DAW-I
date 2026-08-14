package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

// RF-21 a RF-23: procesar el pago de una o varias cuentas por cobrar.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoRequest {

    @NotEmpty(message = "Debe indicar al menos una cuenta por cobrar")
    private List<Long> cuentaIds;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;
}

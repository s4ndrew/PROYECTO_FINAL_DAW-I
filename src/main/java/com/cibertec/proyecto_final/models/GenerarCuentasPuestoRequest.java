package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

// RF-16: generar cuentas por cobrar de un servicio de costo FIJO para una lista de puestos.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarCuentasPuestoRequest {

    @NotNull(message = "El servicio es obligatorio")
    private Long servicioId;

    @NotEmpty(message = "Debe indicar al menos un puesto")
    private List<Long> puestoIds;

    @NotNull(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "El periodo debe tener el formato AAAA-MM")
    private String periodo;
}

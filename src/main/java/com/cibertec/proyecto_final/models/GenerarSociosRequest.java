package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

// RF-18 / RN-06: generar cuentas por cobrar de un servicio para socios, filtrando por etapa
// y opcionalmente deduplicando por nombre+apellido.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarSociosRequest {

    @NotNull(message = "El servicio es obligatorio")
    private Long servicioId;

    @NotNull(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "El periodo debe tener el formato AAAA-MM")
    private String periodo;

    // Si viene vacío o null, no filtra por etapa (aplica a todos los socios).
    private List<String> etapas;

    @Builder.Default
    private boolean soloUnicos = false;
}

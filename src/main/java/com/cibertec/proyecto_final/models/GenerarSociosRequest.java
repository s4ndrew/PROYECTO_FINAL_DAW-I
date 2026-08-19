package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

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

    private List<String> etapas;

    @Builder.Default
    private boolean soloUnicos = false;
}

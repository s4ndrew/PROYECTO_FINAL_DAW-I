package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanjeBancarioRequest {

    @NotNull(message = "La cuenta por cobrar es obligatoria")
    private Long cuentaId;

    @NotNull(message = "El banco es obligatorio")
    private Long bancoId;

    @NotNull(message = "La fecha de depósito es obligatoria")
    private LocalDate fechaDeposito;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;
}

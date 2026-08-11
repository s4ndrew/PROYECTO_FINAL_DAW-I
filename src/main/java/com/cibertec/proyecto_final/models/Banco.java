package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Banco {
    private Long id;
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "El número de cuenta es obligatorio")
    @Pattern(regexp = "^[0-9]{6,20}$",
            message = "El número de cuenta debe contener entre 6 y 20 dígitos")
    private String numeroCuenta;

    @NotBlank(message = "El CCI es obligatorio")
    @Pattern(regexp = "^[0-9]{20}$",
            message = "El CCI debe contener exactamente 20 dígitos")
    private String cci;

    @NotBlank(message = "La moneda es obligatoria")
    @Pattern(regexp = "^PEN$", message = "La moneda debe ser PEN")
    private String moneda;
}

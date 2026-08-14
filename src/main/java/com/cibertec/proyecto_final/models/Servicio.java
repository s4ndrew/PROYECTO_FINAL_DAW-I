package com.cibertec.proyecto_final.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Servicio {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "La recurrencia es obligatoria")
    @Size(max = 50, message = "La recurrencia no puede superar los 50 caracteres")
    private String recurrencia;

    @NotBlank(message = "La moneda es obligatoria")
    @Size(max = 10, message = "La moneda no puede superar los 10 caracteres")
    private String moneda;

    @NotNull(message = "El costo es obligatorio")
    @Positive(message = "El costo debe ser mayor a 0")
    private Double costo;

    // RN-02: los servicios pueden cargarse a puestos o socios.
    @NotBlank(message = "El destino de cargo es obligatorio")
    @Pattern(regexp = "^(SOCIO|PUESTO)$", message = "El destino de cargo debe ser SOCIO o PUESTO")
    private String destinoCargo;

    // RF-15: el servicio es costo fijo o depende de consumo.
    @NotBlank(message = "El tipo de costo es obligatorio")
    @Pattern(regexp = "^(FIJO|CONSUMO)$", message = "El tipo de costo debe ser FIJO o CONSUMO")
    private String tipoCosto;

    // RN-05: solo aplica (y es obligatorio en la práctica) cuando tipoCosto = CONSUMO;
    // no lleva @NotNull porque en servicios de tipoCosto FIJO no se usa.
    @Positive(message = "El costo unitario debe ser mayor a 0")
    private BigDecimal costoUnitario;

    @Builder.Default()
    private boolean estado = true;
}

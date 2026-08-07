package com.cibertec.proyecto_final.models;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Servicio {
    private Long id;
    @NotBlank
    private String nombre;
    @NotBlank
    private String recurrencia;
    @NotBlank
    private String moneda;
    @NotNull
    private Double costo;
    @NotBlank
    private String destinoCargo;
    @NotBlank
    private String tipoCosto;
}

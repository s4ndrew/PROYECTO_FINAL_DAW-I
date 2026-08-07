package com.cibertec.proyecto_final.models;

import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Servicio {
    private Long id;
    private String nombre;
    private String recurrencia;
    private String moneda;
    private Double costo;
    private String destinoCargo;
    private String tipoCosto;
}

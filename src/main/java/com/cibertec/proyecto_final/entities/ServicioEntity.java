package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "servicios")
public class ServicioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String recurrencia;
    private String moneda;
    private Double costo;
    private String destinoCargo;
    private String tipoCosto;
    private boolean estado;
    // Solo se usa cuando tipoCosto = CONSUMO (RF-17): monto = consumo * costoUnitario.
    private BigDecimal costoUnitario;
}

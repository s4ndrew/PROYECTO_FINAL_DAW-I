package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "socios")
public class SocioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String recurrencia;
    private String moneda;
    private Double costo;
    private String destinoCargo;
    private String tipoCosto;
}

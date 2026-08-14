package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
// RNF-09: índice para acelerar la búsqueda por texto (RNF-07) sobre una lista extensa de socios.
@Table(name = "socios", indexes = {
        @Index(name = "idx_socios_nombre_apellidos", columnList = "nombre, apellidos")
})
public class SocioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigo;
    private String nombre;
    private String apellidos;
    private String accion;
    private String etapa;
    private LocalDate fechaNacimiento;
}

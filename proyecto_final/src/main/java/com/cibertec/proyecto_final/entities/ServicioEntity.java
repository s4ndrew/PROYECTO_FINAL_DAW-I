package com.cibertec.proyecto_final.entities;

import jakarta.persistence.Entity;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ServicioEntity {
    private Long id;
    private String codigo;
    private String nombre;
    private String apellidos;
    private String accion;
    private String etapa;
    private LocalDate fechaNacimiento;
}

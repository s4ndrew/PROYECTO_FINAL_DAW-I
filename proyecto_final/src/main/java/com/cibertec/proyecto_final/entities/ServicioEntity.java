package com.cibertec.proyecto_final.entities;

import jakarta.persistence.Entity;
import lombok.*;

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
    
}

package com.cibertec.proyecto_final.models;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Socio {
        private Long id;
        private String nombre;
        private String recurrencia;
        private String moneda;
        private Double costo;
        private String destinoCargo;
        private String tipoCosto;
}

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
@Table(name = "puestos")
public class PuestoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numero;
    @ManyToOne
    @JoinColumn(name = "socio_id")
    private SocioEntity socio;
    @ManyToOne(optional = false)
    @JoinColumn(name = "giro_id", nullable = false)
    private GiroEntity giro;
    private String inquilinoNombre;
    private String inquilinoDocumento;
    private LocalDate vigenciaInicio;
    private LocalDate vigenciaFin;
}
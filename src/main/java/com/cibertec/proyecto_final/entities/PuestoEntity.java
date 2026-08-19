package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@Entity
@Table(name = "puestos", indexes = {
        @Index(name = "idx_puestos_numero", columnList = "numero")
})
@NoArgsConstructor
@AllArgsConstructor
public class PuestoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
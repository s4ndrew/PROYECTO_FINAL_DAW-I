package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@Entity
@Table(name = "comprobantes_egreso")
@NoArgsConstructor
@AllArgsConstructor
public class ComprobanteEgresoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private LocalDate fechaEmision;
    private BigDecimal monto;
    private String estado;  // EMITIDO, PROCESADO, ANULADO

    @ManyToOne(optional = false)
    @JoinColumn(name = "egreso_id", nullable = false)
    private EgresoEntity egreso;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;
}
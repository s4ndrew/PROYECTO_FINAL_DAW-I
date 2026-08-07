package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
        name = "recibos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tipo", "correlativo"})
)
public class ReciboEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private Long correlativo;
    private LocalDateTime fecha;
    private BigDecimal monto;

    @ManyToOne
    @JoinColumn(name = "socio_id")
    private SocioEntity socio;

    @ManyToOne
    @JoinColumn(name = "puesto_id")
    private PuestoEntity puesto;

    @ManyToOne
    @JoinColumn(name = "banco_id")
    private BancoEntity banco;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;

    private String concepto;
    private String categoria;
    private String depositante;
    private LocalDate fechaDeposito;

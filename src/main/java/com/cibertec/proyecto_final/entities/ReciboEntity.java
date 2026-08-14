package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Entity
// RNF-09: los reportes/listados (RF-29, RF-31, RF-32) filtran por tipo + fecha constantemente.
@Table(
        name = "recibos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tipo", "correlativo"}),
        indexes = @Index(name = "idx_recibos_tipo_fecha", columnList = "tipo, fecha")
)
@NoArgsConstructor
@AllArgsConstructor
public class ReciboEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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

}
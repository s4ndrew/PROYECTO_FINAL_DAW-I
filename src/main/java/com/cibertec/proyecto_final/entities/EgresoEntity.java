package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@Entity
// RNF-09: los reportes de egresos (RF-32) filtran por fecha y por categoría seguido.
@Table(
        name = "egresos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tipo", "correlativo"}),
        indexes = {
                @Index(name = "idx_egresos_fecha", columnList = "fecha"),
                @Index(name = "idx_egresos_categoria", columnList = "categoria")
        }
)
@NoArgsConstructor
@AllArgsConstructor
public class EgresoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private Long correlativo;

    private String proveedor;
    private LocalDate fecha;

    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;

    private String motivo;
    private String categoria;

    @ManyToOne
    @JoinColumn(name = "banco_id")
    private BancoEntity banco;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;
}
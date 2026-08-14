package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * RNF-14: registra quién hizo qué y cuándo en las operaciones sensibles
 * (pagos, canjes, ingresos externos, anulaciones y egresos). No reemplaza
 * el usuarioId que ya guardan Recibo/Egreso: es el log centralizado que
 * permite auditar todas las entidades desde un solo lugar.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "auditoria", indexes = {
        @Index(name = "idx_auditoria_entidad", columnList = "entidad"),
        @Index(name = "idx_auditoria_usuario", columnList = "usuario_id")
})
public class AuditoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Nombre de la entidad afectada: CuentaCobrar, Recibo, Egreso, ComprobanteEgreso, etc.
    @Column(nullable = false, length = 50)
    private String entidad;

    private Long entidadId;

    // PAGO, CANJE, INGRESO_EXTERNO, ANULACION, REGISTRO, PROCESADO, etc.
    @Column(nullable = false, length = 30)
    private String accion;

    @Column(length = 500)
    private String detalle;
}

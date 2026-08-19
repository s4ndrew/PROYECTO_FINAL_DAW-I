package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @Column(nullable = false, length = 50)
    private String entidad;

    private Long entidadId;

    @Column(nullable = false, length = 30)
    private String accion;

    @Column(length = 500)
    private String detalle;
}

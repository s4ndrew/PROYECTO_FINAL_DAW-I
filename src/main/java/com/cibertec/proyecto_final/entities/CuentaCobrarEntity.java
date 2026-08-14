package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
// RNF-09: los listados y reportes filtran seguido por estado/periodo (RN-03, RN-07).
@Table(name = "cuentas_cobrar", indexes = {
        @Index(name = "idx_cxc_estado", columnList = "estado"),
        @Index(name = "idx_cxc_periodo", columnList = "periodo")
})
public class CuentaCobrarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "servicio_id", nullable = false)
    private ServicioEntity servicio;

    // Uno de los dos debe venir, según destinoCargo del servicio (RN-02).
    @ManyToOne
    @JoinColumn(name = "socio_id")
    private SocioEntity socio;

    @ManyToOne
    @JoinColumn(name = "puesto_id")
    private PuestoEntity puesto;

    @Column(name = "periodo", nullable = false, length = 7)
    private String periodo;

    @Column(name = "lectura_inicial")
    private BigDecimal lecturaInicial;

    @Column(name = "lectura_final")
    private BigDecimal lecturaFinal;

    @Column(name = "monto", nullable = false)
    private BigDecimal monto;

    // PENDIENTE, ABONADA o EXONERADA (RN-03).
    @Column(name = "estado", length = 12)
    @Builder.Default
    private String estado = "PENDIENTE";

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;
}

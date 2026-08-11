package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cuentas_cobrar")
public class CuentaCobrarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta_cobrar")
    private Integer idCuentaCobrar;

    @Column(name = "importe", nullable = false)
    private Double importe;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "estado", length = 20)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "id_socio")
    private SocioEntity socio;

    @ManyToOne
    @JoinColumn(name = "id_servicio")
    private ServicioEntity servicio;
}
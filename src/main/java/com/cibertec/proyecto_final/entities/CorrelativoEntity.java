package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * RNF-05: un contador por tipo de recibo (INGRESO, EGRESO, BANCO) para que el
 * correlativo nunca se repita ni salte, incluso con pagos concurrentes (ver
 * ICorrelativoRepository, que bloquea la fila con PESSIMISTIC_WRITE).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "correlativos")
public class CorrelativoEntity {

    @Id
    private String tipo;

    private Long ultimoNumero;
}

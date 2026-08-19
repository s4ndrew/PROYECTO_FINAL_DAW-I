package com.cibertec.proyecto_final.entities;

import jakarta.persistence.*;
import lombok.*;

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

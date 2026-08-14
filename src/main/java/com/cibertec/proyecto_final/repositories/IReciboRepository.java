package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.ReciboEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IReciboRepository extends JpaRepository<ReciboEntity, Long> {

    // RF-29: listar recibos de ingreso por fecha.
    List<ReciboEntity> findByTipoAndFechaBetween(String tipo, LocalDateTime desde, LocalDateTime hasta);

    // RF-31: listar recibos bancarios por fecha.
    List<ReciboEntity> findByTipoAndFechaDeposito(String tipo, LocalDate fechaDeposito);

    List<ReciboEntity> findBySocio_Id(Long socioId);

    List<ReciboEntity> findByPuesto_Id(Long puestoId);

    // RNF-05: recuperar el último correlativo emitido para un tipo de recibo.
    List<ReciboEntity> findTop1ByTipoOrderByCorrelativoDesc(String tipo);
}

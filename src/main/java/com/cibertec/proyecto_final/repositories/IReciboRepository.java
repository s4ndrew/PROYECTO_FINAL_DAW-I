package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.ReciboEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IReciboRepository extends JpaRepository<ReciboEntity, Long> {

    List<ReciboEntity> findByTipoAndFechaBetween(String tipo, LocalDateTime desde, LocalDateTime hasta);

    List<ReciboEntity> findByTipoAndFechaDeposito(String tipo, LocalDate fechaDeposito);

    List<ReciboEntity> findBySocio_Id(Long socioId);

    List<ReciboEntity> findByPuesto_Id(Long puestoId);

    List<ReciboEntity> findTop1ByTipoOrderByCorrelativoDesc(String tipo);
}

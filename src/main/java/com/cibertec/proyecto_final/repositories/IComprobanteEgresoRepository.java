package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.ComprobanteEgresoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IComprobanteEgresoRepository extends JpaRepository<ComprobanteEgresoEntity, Long> {
    List<ComprobanteEgresoEntity> findByFechaEmisionBetween(LocalDate fechaInicio, LocalDate fechaFin);
    List<ComprobanteEgresoEntity> findByEstado(String estado);
}
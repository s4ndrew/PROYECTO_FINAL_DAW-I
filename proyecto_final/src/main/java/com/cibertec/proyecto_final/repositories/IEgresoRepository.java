package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.EgresoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IEgresoRepository extends JpaRepository<EgresoEntity, Long> {

    List<EgresoEntity> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    List<EgresoEntity> findByCategoria(String categoria);
}
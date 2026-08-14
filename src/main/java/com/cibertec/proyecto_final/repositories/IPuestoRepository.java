package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.PuestoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPuestoRepository extends JpaRepository<PuestoEntity, Long> {

    // RNF-07: búsqueda por número de puesto para listas extensas.
    List<PuestoEntity> findByNumeroContainingIgnoreCase(String numero);
}

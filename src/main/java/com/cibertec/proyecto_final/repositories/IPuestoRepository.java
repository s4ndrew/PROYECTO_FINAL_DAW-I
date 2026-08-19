package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.PuestoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPuestoRepository extends JpaRepository<PuestoEntity, Long> {

    List<PuestoEntity> findByNumeroContainingIgnoreCase(String numero);
}

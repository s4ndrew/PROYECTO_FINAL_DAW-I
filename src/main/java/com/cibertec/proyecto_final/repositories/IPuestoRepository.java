package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.PuestoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPuestoRepository extends JpaRepository<PuestoEntity, Long> {
}

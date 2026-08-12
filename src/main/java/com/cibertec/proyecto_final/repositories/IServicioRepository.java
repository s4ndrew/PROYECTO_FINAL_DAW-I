package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.ServicioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServicioRepository extends JpaRepository<ServicioEntity, Long> {
}

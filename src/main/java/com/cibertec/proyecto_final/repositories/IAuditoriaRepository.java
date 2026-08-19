package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.AuditoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAuditoriaRepository extends JpaRepository<AuditoriaEntity, Long> {
    List<AuditoriaEntity> findByEntidad(String entidad);
    List<AuditoriaEntity> findByUsuario_Id(Long usuarioId);
}

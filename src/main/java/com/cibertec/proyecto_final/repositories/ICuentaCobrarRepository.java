package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.CuentaCobrarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICuentaCobrarRepository extends JpaRepository<CuentaCobrarEntity, Long> {

    List<CuentaCobrarEntity> findBySocio_Id(Long socioId);
    List<CuentaCobrarEntity> findByPuesto_Id(Long puestoId);

    boolean existsByServicio_IdAndPuesto_IdAndPeriodo(Long servicioId, Long puestoId, String periodo);
    boolean existsByServicio_IdAndSocio_IdAndPeriodo(Long servicioId, Long socioId, String periodo);
}

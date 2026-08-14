package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.CorrelativoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICorrelativoRepository extends JpaRepository<CorrelativoEntity, String> {

    // RNF-05: bloquea la fila hasta que termine la transacción, así dos pagos
    // simultáneos no pueden leer el mismo "último número" y repetirlo.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CorrelativoEntity> findById(String tipo);
}

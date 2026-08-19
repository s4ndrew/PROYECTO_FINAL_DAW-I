package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.CorrelativoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICorrelativoRepository extends JpaRepository<CorrelativoEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CorrelativoEntity> findById(String tipo);
}

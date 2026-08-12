package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.CuentaCobrarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICuentaCobrarRepository extends JpaRepository<CuentaCobrarEntity, Long> {
}

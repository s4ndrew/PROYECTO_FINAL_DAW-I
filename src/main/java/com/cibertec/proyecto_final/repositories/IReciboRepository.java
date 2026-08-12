package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.ReciboEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IReciboRepository extends JpaRepository<ReciboEntity, Long> {
}

package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.BancoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IBancoRepository extends JpaRepository<BancoEntity, Long> {
}

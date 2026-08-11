package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IUsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

}

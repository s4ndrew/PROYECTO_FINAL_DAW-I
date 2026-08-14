package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    // RF-01: buscar por el nombre de usuario para el login.
    Optional<UsuarioEntity> findByUsuario(String usuario);
}

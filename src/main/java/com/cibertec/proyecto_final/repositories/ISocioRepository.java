package com.cibertec.proyecto_final.repositories;

import com.cibertec.proyecto_final.entities.SocioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISocioRepository extends JpaRepository<SocioEntity, Long> {

    // RNF-07: búsqueda de texto libre para no tener que recorrer toda la lista en el frontend.
    List<SocioEntity> findByCodigoContainingIgnoreCaseOrNombreContainingIgnoreCaseOrApellidosContainingIgnoreCase(
            String codigo, String nombre, String apellidos);
}

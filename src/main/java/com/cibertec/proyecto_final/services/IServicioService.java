package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Servicio;

import java.util.List;
import java.util.Optional;

public interface IServicioService {
    List<Servicio> listarTodos();
    Optional<Servicio> buscarPorId(Long id);
    Servicio guardar(Servicio servicio);
    Servicio actualizar(Long id, Servicio servicio);
    void eliminar(Long id);

    //Metodos solicitados
    List<Servicio> listarActivos();
    Servicio cambiarEstado(Long id, Boolean activo);
}

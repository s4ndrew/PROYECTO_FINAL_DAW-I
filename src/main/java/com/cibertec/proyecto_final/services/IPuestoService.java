package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Puesto;

import java.util.List;

public interface IPuestoService {
    List<Puesto> obtenerPuestos();
    Puesto obtenerIdPuesto(Long id);
    Puesto crearPuesto(Puesto puesto);
    Puesto editarPuesto(Long id, Puesto puesto);
    boolean eliminarPuesto(Long id);
}

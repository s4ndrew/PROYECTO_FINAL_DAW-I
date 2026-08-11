package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Giro;

import java.util.List;

public interface IGiroService {
    List<Giro> obtenerGiros();
    Giro obtenerIdGiro(Long id);
    Giro crearGiro(Giro giro);
    Giro editarGiro(Long id, Giro giro);
    boolean eliminarGiro(Long id);
}

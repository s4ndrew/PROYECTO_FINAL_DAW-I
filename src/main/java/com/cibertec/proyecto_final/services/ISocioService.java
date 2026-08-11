package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Socio;

import java.util.List;

public interface ISocioService {
    List<Socio> obtenerSocios();
    Socio obtenerIdSocio(Long id);
    Socio crearSocio(Socio socio);
    Socio editarSocio(Long id, Socio socio);
    boolean eliminarSocio(Long id);
}

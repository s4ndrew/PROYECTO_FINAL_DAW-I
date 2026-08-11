package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Egreso;

import java.time.LocalDate;
import java.util.List;

public interface IEgresoService {

    List<Egreso> listarEgresos();

    Egreso obtenerEgresoPorId(Long id);

    Egreso registrarEgreso(Egreso egreso);

    Egreso actualizarEgreso(Long id, Egreso egreso);

    void eliminarEgreso(Long id);

    List<Egreso> listarEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin);

    List<Egreso> listarEgresosPorCategoria(String categoria);
}
package com.cibertec.proyecto_final.services;

import java.time.LocalDate;

public interface IReporteService {
    byte[] generarReporteEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin);
    byte[] generarReporteEgresosPorCategoria(String categoria);
}
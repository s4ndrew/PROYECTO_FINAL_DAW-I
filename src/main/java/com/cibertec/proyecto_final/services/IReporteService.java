package com.cibertec.proyecto_final.services;

import java.time.LocalDate;

public interface IReporteService {
    // RF-32: movimientos diarios, totales y mensuales.
    byte[] generarReporteEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin);
    byte[] generarReporteEgresosPorCategoria(String categoria);
    byte[] generarReporteRecibosPorFecha(LocalDate fecha);
    byte[] generarReporteRecibosPorMes(int anio, int mes);

    // RF-33: reportes específicos de socios, no socios, egresos y bancos.
    // (egresos ya cubierto arriba con los dos métodos de EgresoEntity)
    byte[] generarReporteSocios();
    byte[] generarReporteNoSocios();
    byte[] generarReporteBancos();
}

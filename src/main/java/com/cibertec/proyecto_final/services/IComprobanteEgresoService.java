package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.ComprobanteEgreso;

import java.time.LocalDate;
import java.util.List;

public interface IComprobanteEgresoService {
    List<ComprobanteEgreso> listarComprobantes();
    ComprobanteEgreso obtenerComprobantePorId(Long id);
    ComprobanteEgreso registrarComprobante(ComprobanteEgreso comprobante);
    List<ComprobanteEgreso> listarComprobantesPorMes(LocalDate fechaInicio, LocalDate fechaFin);
    ComprobanteEgreso anularComprobante(Long id);
    ComprobanteEgreso procesarComprobante(Long id);
}
package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.ComprobanteEgreso;

import java.time.LocalDate;
import java.util.List;

public interface IComprobanteEgresoService {
    List<ComprobanteEgreso> listarComprobantes();
    ComprobanteEgreso obtenerComprobantePorId(Long id);
    ComprobanteEgreso registrarComprobante(ComprobanteEgreso comprobante);
    List<ComprobanteEgreso> listarComprobantesPorMes(LocalDate fechaInicio, LocalDate fechaFin);
    // RNF-14: se pide el usuario que anula/procesa para dejar constancia en la auditoría.
    ComprobanteEgreso anularComprobante(Long id, Long usuarioId);
    ComprobanteEgreso procesarComprobante(Long id, Long usuarioId);
}
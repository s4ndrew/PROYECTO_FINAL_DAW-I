package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.services.IReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final IReporteService iReporteService;

    @GetMapping("/egresos/por-fecha")
    public ResponseEntity<byte[]> descargarReporteEgresosPorFecha(
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {

        byte[] archivo = iReporteService.generarReporteEgresosPorFecha(fechaInicio, fechaFin);
        String nombreArchivo = "reporte_egresos_" + fechaInicio + "_a_" + fechaFin + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(archivo);
    }

    @GetMapping("/egresos/por-categoria/{categoria}")
    public ResponseEntity<byte[]> descargarReporteEgresosPorCategoria(@PathVariable String categoria) {

        byte[] archivo = iReporteService.generarReporteEgresosPorCategoria(categoria);
        String nombreArchivo = "reporte_egresos_" + categoria + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(archivo);
    }
}
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

    private static final String XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final IReporteService iReporteService;

    @GetMapping("/egresos/por-fecha")
    public ResponseEntity<byte[]> descargarReporteEgresosPorFecha(
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        byte[] archivo = iReporteService.generarReporteEgresosPorFecha(fechaInicio, fechaFin);
        return descargar(archivo, "reporte_egresos_" + fechaInicio + "_a_" + fechaFin + ".xlsx");
    }

    @GetMapping("/egresos/por-categoria/{categoria}")
    public ResponseEntity<byte[]> descargarReporteEgresosPorCategoria(@PathVariable String categoria) {
        byte[] archivo = iReporteService.generarReporteEgresosPorCategoria(categoria);
        return descargar(archivo, "reporte_egresos_" + categoria + ".xlsx");
    }

    // RF-32: movimientos diarios.
    @GetMapping("/recibos/diario")
    public ResponseEntity<byte[]> descargarReporteRecibosDiario(@RequestParam LocalDate fecha) {
        byte[] archivo = iReporteService.generarReporteRecibosPorFecha(fecha);
        return descargar(archivo, "reporte_recibos_" + fecha + ".xlsx");
    }

    // RF-32: totales y movimientos mensuales.
    @GetMapping("/recibos/mensual")
    public ResponseEntity<byte[]> descargarReporteRecibosMensual(
            @RequestParam int anio,
            @RequestParam int mes) {
        byte[] archivo = iReporteService.generarReporteRecibosPorMes(anio, mes);
        return descargar(archivo, "reporte_recibos_" + anio + "-" + mes + ".xlsx");
    }

    // RF-33
    @GetMapping("/socios")
    public ResponseEntity<byte[]> descargarReporteSocios() {
        byte[] archivo = iReporteService.generarReporteSocios();
        return descargar(archivo, "reporte_socios.xlsx");
    }

    // RF-33: ingresos externos, no ligados a un socio (ver RF-25).
    @GetMapping("/no-socios")
    public ResponseEntity<byte[]> descargarReporteNoSocios() {
        byte[] archivo = iReporteService.generarReporteNoSocios();
        return descargar(archivo, "reporte_no_socios.xlsx");
    }

    // RF-33
    @GetMapping("/bancos")
    public ResponseEntity<byte[]> descargarReporteBancos() {
        byte[] archivo = iReporteService.generarReporteBancos();
        return descargar(archivo, "reporte_bancos.xlsx");
    }

    private ResponseEntity<byte[]> descargar(byte[] archivo, String nombreArchivo) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.parseMediaType(XLSX_TYPE))
                .body(archivo);
    }
}

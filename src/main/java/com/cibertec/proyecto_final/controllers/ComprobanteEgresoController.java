package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.ComprobanteEgreso;
import com.cibertec.proyecto_final.services.IComprobanteEgresoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/comprobantes-egreso")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComprobanteEgresoController {

    private final IComprobanteEgresoService iComprobanteEgresoService;

    @GetMapping
    public ResponseEntity<List<ComprobanteEgreso>> listarComprobantes() {
        return ResponseEntity.ok(iComprobanteEgresoService.listarComprobantes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComprobanteEgreso> obtenerComprobantePorId(@PathVariable Long id) {
        return ResponseEntity.ok(iComprobanteEgresoService.obtenerComprobantePorId(id));
    }

    @PostMapping
    public ResponseEntity<ComprobanteEgreso> registrarComprobante(@Valid @RequestBody ComprobanteEgreso comprobante) {
        ComprobanteEgreso nuevo = iComprobanteEgresoService.registrarComprobante(comprobante);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping("/por-mes")
    public ResponseEntity<List<ComprobanteEgreso>> listarComprobantesPorMes(
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        return ResponseEntity.ok(iComprobanteEgresoService.listarComprobantesPorMes(fechaInicio, fechaFin));
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<ComprobanteEgreso> anularComprobante(@PathVariable Long id, @RequestParam Long usuarioId) {
        return ResponseEntity.ok(iComprobanteEgresoService.anularComprobante(id, usuarioId));
    }

    @PatchMapping("/{id}/procesar")
    public ResponseEntity<ComprobanteEgreso> procesarComprobante(@PathVariable Long id, @RequestParam Long usuarioId) {
        return ResponseEntity.ok(iComprobanteEgresoService.procesarComprobante(id, usuarioId));
    }
}
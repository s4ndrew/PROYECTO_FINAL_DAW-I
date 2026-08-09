package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Egreso;
import com.cibertec.proyecto_final.services.IEgresoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/egresos")
@RequiredArgsConstructor
public class EgresoController {

    private final IEgresoService iEgresoService;

    @GetMapping
    public ResponseEntity<List<Egreso>> listarEgresos() {
        return ResponseEntity.ok(iEgresoService.listarEgresos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Egreso> obtenerEgresoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(iEgresoService.obtenerEgresoPorId(id));
    }

    @PostMapping
    public ResponseEntity<Egreso> registrarEgreso(@Valid @RequestBody Egreso egreso) {
        Egreso nuevo = iEgresoService.registrarEgreso(egreso);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Egreso> actualizarEgreso(@PathVariable Long id, @Valid @RequestBody Egreso egreso) {
        return ResponseEntity.ok(iEgresoService.actualizarEgreso(id, egreso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEgreso(@PathVariable Long id) {
        iEgresoService.eliminarEgreso(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/por-fecha")
    public ResponseEntity<List<Egreso>> listarEgresosPorFecha(
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        return ResponseEntity.ok(iEgresoService.listarEgresosPorFecha(fechaInicio, fechaFin));
    }

    @GetMapping("/por-categoria/{categoria}")
    public ResponseEntity<List<Egreso>> listarEgresosPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(iEgresoService.listarEgresosPorCategoria(categoria));
    }
}
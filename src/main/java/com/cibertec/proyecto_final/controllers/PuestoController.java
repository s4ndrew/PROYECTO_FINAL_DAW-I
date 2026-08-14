package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Puesto;
import com.cibertec.proyecto_final.services.IPuestoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/puestos")
@RequiredArgsConstructor
public class PuestoController {

    private final IPuestoService iPuestoService;

    @GetMapping
    public ResponseEntity<List<Puesto>> obtenerPuestos() {
        return ResponseEntity.ok(iPuestoService.obtenerPuestos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Puesto> obtenerIdPuesto(@PathVariable Long id) {
        Puesto puesto = iPuestoService.obtenerIdPuesto(id);
        if (puesto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(puesto);
    }

    // RNF-07: búsqueda por número de puesto para listas extensas.
    @GetMapping("/buscar")
    public ResponseEntity<List<Puesto>> buscarPuestos(@RequestParam String numero) {
        return ResponseEntity.ok(iPuestoService.buscar(numero));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Puesto> crearPuesto(@RequestBody @Valid Puesto puesto) {
        Puesto creado = iPuestoService.crearPuesto(puesto);
        if (creado == null) {
            // giroId o socioId no corresponden a un registro existente.
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(creado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Puesto> editarPuesto(@PathVariable Long id, @RequestBody @Valid Puesto puesto) {
        Puesto actualizado = iPuestoService.editarPuesto(id, puesto);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(actualizado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPuesto(@PathVariable Long id) {
        boolean eliminado = iPuestoService.eliminarPuesto(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

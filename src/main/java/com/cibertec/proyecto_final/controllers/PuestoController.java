package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Puesto;
import com.cibertec.proyecto_final.services.IPuestoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<Puesto> crearPuesto(@RequestBody @Valid Puesto puesto) {
        Puesto creado = iPuestoService.crearPuesto(puesto);
        if (creado == null) {
            // giroId o socioId no corresponden a un registro existente.
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Puesto> editarPuesto(@PathVariable Long id, @RequestBody @Valid Puesto puesto) {
        Puesto actualizado = iPuestoService.editarPuesto(id, puesto);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPuesto(@PathVariable Long id) {
        boolean eliminado = iPuestoService.eliminarPuesto(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

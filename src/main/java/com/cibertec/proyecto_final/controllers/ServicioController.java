package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Servicio;
import com.cibertec.proyecto_final.services.IServicioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final IServicioService iServicioService;

    // RF-13
    @GetMapping
    public ResponseEntity<List<Servicio>> listarTodos() {
        return ResponseEntity.ok(iServicioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> buscarPorId(@PathVariable Long id) {
        return iServicioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Servicio>> listarActivos() {
        return ResponseEntity.ok(iServicioService.listarActivos());
    }

    // RF-13 / RF-14 / RF-15 — gestión de catálogos: solo Administrador (RNF-02).
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Servicio> guardar(@RequestBody @Valid Servicio servicio) {
        return ResponseEntity.ok(iServicioService.guardar(servicio));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Servicio> actualizar(@PathVariable Long id, @RequestBody @Valid Servicio servicio) {
        return ResponseEntity.ok(iServicioService.actualizar(id, servicio));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Servicio> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        return ResponseEntity.ok(iServicioService.cambiarEstado(id, activo));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        iServicioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Giro;
import com.cibertec.proyecto_final.services.IGiroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/giros")
@RequiredArgsConstructor
public class GiroController {

    private final IGiroService iGiroService;

    @GetMapping
    public ResponseEntity<List<Giro>> obtenerGiros() {
        return ResponseEntity.ok(iGiroService.obtenerGiros());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Giro> obtenerIdGiro(@PathVariable Long id) {
        Giro giro = iGiroService.obtenerIdGiro(id);
        if (giro == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(giro);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Giro> crearGiro(@RequestBody @Valid Giro giro) {
        return ResponseEntity.ok(iGiroService.crearGiro(giro));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Giro> editarGiro(@PathVariable Long id, @RequestBody @Valid Giro giro) {
        Giro giroActualizado = iGiroService.editarGiro(id, giro);
        if (giroActualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(giroActualizado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarGiro(@PathVariable Long id) {
        boolean eliminado = iGiroService.eliminarGiro(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

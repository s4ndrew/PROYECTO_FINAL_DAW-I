package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Socio;
import com.cibertec.proyecto_final.services.ISocioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RNF-02: la consulta del catálogo de socios queda disponible para cualquier
 * usuario autenticado (el operador de caja necesita buscarlos para cobrar),
 * pero gestionarlo (crear/editar/eliminar) es tarea exclusiva del Administrador.
 */
@RestController
@RequestMapping("/socios")
@RequiredArgsConstructor
public class SocioController {

    private final ISocioService iSocioService;

    @GetMapping
    public ResponseEntity<List<Socio>> obtenerSocios() {
        return ResponseEntity.ok(iSocioService.obtenerSocios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Socio> obtenerIdSocio(@PathVariable Long id) {
        Socio socio = iSocioService.obtenerIdSocio(id);
        if (socio == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(socio);
    }

    // RNF-07: búsqueda por código, nombre o apellidos para listas extensas.
    @GetMapping("/buscar")
    public ResponseEntity<List<Socio>> buscarSocios(@RequestParam String texto) {
        return ResponseEntity.ok(iSocioService.buscar(texto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Socio> crearSocio(@RequestBody @Valid Socio socio) {
        return ResponseEntity.ok(iSocioService.crearSocio(socio));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Socio> editarSocio(@PathVariable Long id, @RequestBody @Valid Socio socio) {
        Socio socioActualizado = iSocioService.editarSocio(id, socio);
        if (socioActualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(socioActualizado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSocio(@PathVariable Long id) {
        boolean eliminado = iSocioService.eliminarSocio(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

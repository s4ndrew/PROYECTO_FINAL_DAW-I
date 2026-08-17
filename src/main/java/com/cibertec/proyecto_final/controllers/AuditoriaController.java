package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Auditoria;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// RNF-14: consultar "quién hizo qué y cuándo" es una tarea de supervisión, exclusiva del Administrador.
@RestController
@RequestMapping("/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AuditoriaController {

    private final IAuditoriaService iAuditoriaService;

    @GetMapping
    public ResponseEntity<List<Auditoria>> listarTodas() {
        return ResponseEntity.ok(iAuditoriaService.listarTodas());
    }

    @GetMapping("/entidad/{entidad}")
    public ResponseEntity<List<Auditoria>> listarPorEntidad(@PathVariable String entidad) {
        return ResponseEntity.ok(iAuditoriaService.listarPorEntidad(entidad));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Auditoria>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(iAuditoriaService.listarPorUsuario(usuarioId));
    }
}

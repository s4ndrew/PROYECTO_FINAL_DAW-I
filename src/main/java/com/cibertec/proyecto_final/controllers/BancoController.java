package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.Banco;
import com.cibertec.proyecto_final.services.IBancoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bancos")
@RequiredArgsConstructor
public class BancoController {

    private final IBancoService iBancoService;

    @GetMapping
    public ResponseEntity<List<Banco>> obtenerBancos() {
        return ResponseEntity.ok(iBancoService.obtenerBancos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banco> obtenerIdBanco(@PathVariable Long id) {
        Banco banco = iBancoService.obtenerIdBanco(id);
        if (banco == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(banco);
    }

    @PostMapping
    public ResponseEntity<Banco> crearBanco(@RequestBody @Valid Banco banco) {
        return ResponseEntity.ok(iBancoService.crearBanco(banco));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banco> editarBanco(@PathVariable Long id, @RequestBody @Valid Banco banco) {
        Banco bancoActualizado = iBancoService.editarBanco(id, banco);
        if (bancoActualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bancoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBanco(@PathVariable Long id) {
        boolean eliminado = iBancoService.eliminarBanco(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

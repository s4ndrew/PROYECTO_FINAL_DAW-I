package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.CuentaCobrar;
import com.cibertec.proyecto_final.models.GenerarConsumoRequest;
import com.cibertec.proyecto_final.models.GenerarCuentasPuestoRequest;
import com.cibertec.proyecto_final.models.GenerarSociosRequest;
import com.cibertec.proyecto_final.services.ICuentaCobrarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cuentas-cobrar")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CuentaCobrarController {

    private final ICuentaCobrarService iCuentaCobrarService;

    @GetMapping
    public ResponseEntity<List<CuentaCobrar>> listarTodas() {
        return ResponseEntity.ok(iCuentaCobrarService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuentaCobrar> buscarPorId(@PathVariable Long id) {
        return iCuentaCobrarService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // RF-19
    @GetMapping("/socio/{socioId}")
    public ResponseEntity<List<CuentaCobrar>> listarPorSocio(@PathVariable Long socioId) {
        return ResponseEntity.ok(iCuentaCobrarService.listarPorSocio(socioId));
    }

    @GetMapping("/puesto/{puestoId}")
    public ResponseEntity<List<CuentaCobrar>> listarPorPuesto(@PathVariable Long puestoId) {
        return ResponseEntity.ok(iCuentaCobrarService.listarPorPuesto(puestoId));
    }

    // RF-16
    @PostMapping("/generar/puestos")
    public ResponseEntity<List<CuentaCobrar>> generarParaPuestos(@RequestBody @Valid GenerarCuentasPuestoRequest request) {
        return ResponseEntity.ok(iCuentaCobrarService.generarParaPuestos(request));
    }

    // RF-17
    @PostMapping("/generar/consumo")
    public ResponseEntity<CuentaCobrar> generarPorConsumo(@RequestBody @Valid GenerarConsumoRequest request) {
        return ResponseEntity.ok(iCuentaCobrarService.generarPorConsumo(request));
    }

    // RF-18
    @PostMapping("/generar/socios")
    public ResponseEntity<List<CuentaCobrar>> generarParaSocios(@RequestBody @Valid GenerarSociosRequest request) {
        return ResponseEntity.ok(iCuentaCobrarService.generarParaSocios(request));
    }

    // RF-21
    @PatchMapping("/{id}/abonar")
    public ResponseEntity<CuentaCobrar> marcarAbonada(@PathVariable Long id) {
        return ResponseEntity.ok(iCuentaCobrarService.marcarAbonada(id));
    }

    @PatchMapping("/{id}/exonerar")
    public ResponseEntity<CuentaCobrar> marcarExonerada(@PathVariable Long id) {
        return ResponseEntity.ok(iCuentaCobrarService.marcarExonerada(id));
    }

    // RNF-14: se pide el usuario que anula para dejar constancia en la auditoría.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> anular(@PathVariable Long id, @RequestParam Long usuarioId) {
        iCuentaCobrarService.anularCuenta(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}

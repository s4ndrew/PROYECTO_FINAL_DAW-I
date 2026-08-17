package com.cibertec.proyecto_final.controllers;

import com.cibertec.proyecto_final.models.CanjeBancarioRequest;
import com.cibertec.proyecto_final.models.IngresoExternoRequest;
import com.cibertec.proyecto_final.models.PagoRequest;
import com.cibertec.proyecto_final.models.Recibo;
import com.cibertec.proyecto_final.services.IReciboService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/recibos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReciboController {

    private final IReciboService iReciboService;

    @GetMapping
    public ResponseEntity<List<Recibo>> getAll() {
        return ResponseEntity.ok(iReciboService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recibo> get(@PathVariable Long id) {
        return ResponseEntity.ok(iReciboService.get(id));
    }

    // RF-19 / RF-26
    @GetMapping("/socio/{socioId}")
    public ResponseEntity<List<Recibo>> listarPorSocio(@PathVariable Long socioId) {
        return ResponseEntity.ok(iReciboService.listarPorSocio(socioId));
    }

    @GetMapping("/puesto/{puestoId}")
    public ResponseEntity<List<Recibo>> listarPorPuesto(@PathVariable Long puestoId) {
        return ResponseEntity.ok(iReciboService.listarPorPuesto(puestoId));
    }

    // RF-29
    @GetMapping("/ingresos")
    public ResponseEntity<List<Recibo>> listarIngresosPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(iReciboService.listarIngresosPorFecha(fecha));
    }

    // RF-31
    @GetMapping("/bancarios")
    public ResponseEntity<List<Recibo>> listarBancariosPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(iReciboService.listarBancariosPorFecha(fecha));
    }

    // RF-22 / RF-23
    @PostMapping("/pagos")
    public ResponseEntity<Recibo> procesarPago(@RequestBody @Valid PagoRequest request) {
        return ResponseEntity.ok(iReciboService.procesarPago(request));
    }

    // RF-24
    @PostMapping("/canjes")
    public ResponseEntity<Recibo> canjearCuentaBancaria(@RequestBody @Valid CanjeBancarioRequest request) {
        return ResponseEntity.ok(iReciboService.canjearCuentaBancaria(request));
    }

    // RF-25
    @PostMapping("/ingresos-externos")
    public ResponseEntity<Recibo> registrarIngresoExterno(@RequestBody @Valid IngresoExternoRequest request) {
        return ResponseEntity.ok(iReciboService.registrarIngresoExterno(request));
    }
}

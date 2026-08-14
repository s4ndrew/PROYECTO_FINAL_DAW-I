package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.CanjeBancarioRequest;
import com.cibertec.proyecto_final.models.IngresoExternoRequest;
import com.cibertec.proyecto_final.models.PagoRequest;
import com.cibertec.proyecto_final.models.Recibo;

import java.time.LocalDate;
import java.util.List;

public interface IReciboService {
    Recibo get(Long id);
    List<Recibo> getAll();

    // RF-19/RF-26
    List<Recibo> listarPorSocio(Long socioId);
    List<Recibo> listarPorPuesto(Long puestoId);

    // RF-29: listar recibos de ingreso por fecha.
    List<Recibo> listarIngresosPorFecha(LocalDate fecha);

    // RF-31: listar recibos bancarios por fecha.
    List<Recibo> listarBancariosPorFecha(LocalDate fecha);

    // RF-22 / RF-23: total + marca abonada + emite recibo con correlativo.
    Recibo procesarPago(PagoRequest request);

    // RF-24: canjear una cuenta de socio por una operación bancaria.
    Recibo canjearCuentaBancaria(CanjeBancarioRequest request);

    // RF-25: registrar ingresos externos.
    Recibo registrarIngresoExterno(IngresoExternoRequest request);
}

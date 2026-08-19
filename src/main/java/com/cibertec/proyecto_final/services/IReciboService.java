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

    List<Recibo> listarPorSocio(Long socioId);
    List<Recibo> listarPorPuesto(Long puestoId);

    List<Recibo> listarIngresosPorFecha(LocalDate fecha);

    List<Recibo> listarBancariosPorFecha(LocalDate fecha);

    Recibo procesarPago(PagoRequest request);

    Recibo canjearCuentaBancaria(CanjeBancarioRequest request);

    Recibo registrarIngresoExterno(IngresoExternoRequest request);
}

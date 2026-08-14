package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.CuentaCobrar;
import com.cibertec.proyecto_final.models.GenerarConsumoRequest;
import com.cibertec.proyecto_final.models.GenerarCuentasPuestoRequest;
import com.cibertec.proyecto_final.models.GenerarSociosRequest;

import java.util.List;
import java.util.Optional;

public interface ICuentaCobrarService {
    List<CuentaCobrar> listarTodas();
    Optional<CuentaCobrar> buscarPorId(Long id);

    // RF-19: consultar cuentas por cobrar por socio o por puesto.
    List<CuentaCobrar> listarPorSocio(Long socioId);
    List<CuentaCobrar> listarPorPuesto(Long puestoId);

    // RF-16: generar cuentas de un servicio fijo para una lista de puestos.
    List<CuentaCobrar> generarParaPuestos(GenerarCuentasPuestoRequest request);

    // RF-17 / RN-05: generar cuenta por consumo a partir de lecturas.
    CuentaCobrar generarPorConsumo(GenerarConsumoRequest request);

    // RF-18 / RN-06: generar cuentas para socios filtrando por etapas y deduplicando.
    List<CuentaCobrar> generarParaSocios(GenerarSociosRequest request);

    // RF-21: marcar abonada/exonerada antes de procesar un pago.
    CuentaCobrar marcarAbonada(Long id);
    CuentaCobrar marcarExonerada(Long id);

    // RNF-14: se pide el usuario que anula para dejar constancia en la auditoría.
    void anularCuenta(Long id, Long usuarioId);
}

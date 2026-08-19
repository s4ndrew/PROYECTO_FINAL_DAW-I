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

    List<CuentaCobrar> listarPorSocio(Long socioId);
    List<CuentaCobrar> listarPorPuesto(Long puestoId);

    List<CuentaCobrar> generarParaPuestos(GenerarCuentasPuestoRequest request);

    CuentaCobrar generarPorConsumo(GenerarConsumoRequest request);

    List<CuentaCobrar> generarParaSocios(GenerarSociosRequest request);

    CuentaCobrar marcarAbonada(Long id);
    CuentaCobrar marcarExonerada(Long id);

    void anularCuenta(Long id, Long usuarioId);
}

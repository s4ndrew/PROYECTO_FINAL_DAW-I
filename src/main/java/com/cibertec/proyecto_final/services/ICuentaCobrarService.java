package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.CuentaCobrar;

import java.util.List;
import java.util.Optional;

public interface ICuentaCobrarService {
    List<CuentaCobrar> listarTodas();
    Optional<CuentaCobrar> buscarPorId(Long id);
    CuentaCobrar guardar(CuentaCobrar cuentaCobrar);

    // -------REVISAR -----
    // Listar deudas pendientes de un socio específico (para mostrar en caja/banco)
    List<CuentaCobrar> listarPendientesPorSocio(Long socioId);

    // Actualizar el estado de la cuenta (ej. de "PENDIENTE" a "PAGADO") tras procesar el pago
    CuentaCobrar actualizarEstado(Long idCuentaCobrar, String nuevoEstado);

    // Cancelar/Anular una cuenta por cobrar si hubo algún inconveniente
    void anularCuenta(Long idCuentaCobrar);
}

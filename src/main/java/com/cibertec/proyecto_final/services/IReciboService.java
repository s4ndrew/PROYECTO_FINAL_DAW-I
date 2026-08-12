package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Recibo;

import java.awt.print.Pageable;
import java.util.List;

public interface IReciboService {
    Recibo get(Long id);
    List<Recibo> getAll();
    List<Recibo> getAllFiltered(Pageable pageable);


    // ------POR REVISAR -----
    //Recibo procesarPagoCaja(PagoRequest pagoRequest);
    //Recibo procesarCanjeBancario(PagoRequest pagoRequest);

    // RF-25: Registrar ingresos externos (Depositante, categoría, concepto y monto)
   //Recibo registrarIngresoExterno(IngresoExternoRequest ingresoRequest);

    // Auxiliar para búsquedas del módulo de movimientos
    List<Recibo> search(String tipo, Long correlativo);
}

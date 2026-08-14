package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.CorrelativoEntity;
import com.cibertec.proyecto_final.repositories.ICorrelativoRepository;
import com.cibertec.proyecto_final.services.ICorrelativoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CorrelativoService implements ICorrelativoService {

    private final ICorrelativoRepository iCorrelativoRepository;

    // REQUIRES_NEW: esta transacción se confirma (y libera el lock) apenas
    // termina, sin depender de si el pago que la llamó sigue en curso o falla
    // después. Así el lock pesimista dura lo mínimo posible.
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long generarSiguiente(String tipo) {
        CorrelativoEntity correlativo = iCorrelativoRepository.findById(tipo)
                .orElseGet(() -> CorrelativoEntity.builder().tipo(tipo).ultimoNumero(0L).build());
        Long siguiente = correlativo.getUltimoNumero() + 1;
        correlativo.setUltimoNumero(siguiente);
        iCorrelativoRepository.save(correlativo);
        return siguiente;
    }
}

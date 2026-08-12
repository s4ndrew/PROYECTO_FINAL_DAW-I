package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.CuentaCobrarEntity;
import com.cibertec.proyecto_final.models.CuentaCobrar;
import com.cibertec.proyecto_final.repositories.ICuentaCobrarRepository;
import com.cibertec.proyecto_final.services.ICuentaCobrarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class CuentaCobrarService implements ICuentaCobrarService {

    private final ICuentaCobrarRepository iCuentaCobrarRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<CuentaCobrar> listarTodas() {
        return iCuentaCobrarRepository.findAll().stream()
                .map(entity -> objectMapper.convertValue(entity, CuentaCobrar.class))
                .toList();
    }

    @Override
    public Optional<CuentaCobrar> buscarPorId(Long id) {
        return iCuentaCobrarRepository.findById(id)
                .map(entity -> objectMapper.convertValue(entity, CuentaCobrar.class));
    }

    @Override
    public CuentaCobrar guardar(CuentaCobrar cuentaCobrar) {
        CuentaCobrarEntity entity = objectMapper.convertValue(cuentaCobrar, CuentaCobrarEntity.class);
        return objectMapper.convertValue(iCuentaCobrarRepository.save(entity),CuentaCobrar.class);
    }

    @Override
    public List<CuentaCobrar> listarPendientesPorSocio(Long socioId) {
        return List.of();
    }

    @Override
    public CuentaCobrar actualizarEstado(Long idCuentaCobrar, String nuevoEstado) {
        return iCuentaCobrarRepository.findById(idCuentaCobrar)
                .map(entity -> {
                    entity.setEstado(nuevoEstado); // Modifica el estado (ej: "PAGADO")
                    CuentaCobrarEntity actualizada = iCuentaCobrarRepository.save(entity);
                    return objectMapper.convertValue(actualizada, CuentaCobrar.class);
                }).orElseThrow();
    }

    @Override
    public void anularCuenta(Long idCuentaCobrar) {
        //Validar cuentas por anular
    }
}

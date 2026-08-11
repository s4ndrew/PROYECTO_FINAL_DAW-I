package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.GiroEntity;
import com.cibertec.proyecto_final.entities.PuestoEntity;
import com.cibertec.proyecto_final.entities.SocioEntity;
import com.cibertec.proyecto_final.models.Puesto;
import com.cibertec.proyecto_final.repositories.IGiroRepository;
import com.cibertec.proyecto_final.repositories.IPuestoRepository;
import com.cibertec.proyecto_final.repositories.ISocioRepository;
import com.cibertec.proyecto_final.services.IPuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * A diferencia de Socio/Giro/Banco, acá NO usamos objectMapper.convertValue
 * directo entre PuestoEntity y Puesto. La razón: PuestoEntity guarda las
 * relaciones como objetos completos (SocioEntity, GiroEntity), mientras que
 * el modelo Puesto solo expone sus ids (socioId, giroId), tal como los
 * manda el frontend desde un <select>. Como los nombres/tipos de esos
 * campos no calzan, hay que armar la conversión a mano en los dos sentidos.
 */
@Service
@RequiredArgsConstructor
public class PuestoService implements IPuestoService {

    private final IPuestoRepository iPuestoRepository;
    private final ISocioRepository iSocioRepository;
    private final IGiroRepository iGiroRepository;

    @Override
    public List<Puesto> obtenerPuestos() {
        return iPuestoRepository.findAll()
                .stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public Puesto obtenerIdPuesto(Long id) {
        return iPuestoRepository.findById(id)
                .map(this::convertirAModelo)
                .orElse(null);
    }

    @Override
    public Puesto crearPuesto(Puesto puesto) {
        GiroEntity giroEntity = iGiroRepository.findById(puesto.getGiroId()).orElse(null);
        if (giroEntity == null) {
            // El giro es obligatorio (RF-10): si no existe, no se puede crear el puesto.
            return null;
        }

        SocioEntity socioEntity = null;
        if (puesto.getSocioId() != null) {
            socioEntity = iSocioRepository.findById(puesto.getSocioId()).orElse(null);
            if (socioEntity == null) {
                // Mandaron un socioId que no existe.
                return null;
            }
        }

        PuestoEntity puestoEntity = PuestoEntity.builder()
                .numero(puesto.getNumero())
                .giro(giroEntity)
                .socio(socioEntity)
                .inquilinoNombre(puesto.getInquilinoNombre())
                .inquilinoDocumento(puesto.getInquilinoDocumento())
                .vigenciaInicio(puesto.getVigenciaInicio())
                .vigenciaFin(puesto.getVigenciaFin())
                .build();

        return convertirAModelo(iPuestoRepository.save(puestoEntity));
    }

    @Override
    public Puesto editarPuesto(Long id, Puesto puesto) {
        if (!iPuestoRepository.existsById(id)) {
            return null;
        }

        GiroEntity giroEntity = iGiroRepository.findById(puesto.getGiroId()).orElse(null);
        if (giroEntity == null) {
            return null;
        }

        SocioEntity socioEntity = null;
        if (puesto.getSocioId() != null) {
            socioEntity = iSocioRepository.findById(puesto.getSocioId()).orElse(null);
            if (socioEntity == null) {
                return null;
            }
        }

        PuestoEntity puestoEntity = PuestoEntity.builder()
                .id(id)
                .numero(puesto.getNumero())
                .giro(giroEntity)
                .socio(socioEntity)
                .inquilinoNombre(puesto.getInquilinoNombre())
                .inquilinoDocumento(puesto.getInquilinoDocumento())
                .vigenciaInicio(puesto.getVigenciaInicio())
                .vigenciaFin(puesto.getVigenciaFin())
                .build();

        return convertirAModelo(iPuestoRepository.save(puestoEntity));
    }

    @Override
    public boolean eliminarPuesto(Long id) {
        if (!iPuestoRepository.existsById(id)) {
            return false;
        }
        iPuestoRepository.deleteById(id);
        return true;
    }

    private Puesto convertirAModelo(PuestoEntity entity) {
        return Puesto.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .giroId(entity.getGiro() != null ? entity.getGiro().getId() : null)
                .socioId(entity.getSocio() != null ? entity.getSocio().getId() : null)
                .inquilinoNombre(entity.getInquilinoNombre())
                .inquilinoDocumento(entity.getInquilinoDocumento())
                .vigenciaInicio(entity.getVigenciaInicio())
                .vigenciaFin(entity.getVigenciaFin())
                .build();
    }
}

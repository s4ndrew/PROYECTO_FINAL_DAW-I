package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.GiroEntity;
import com.cibertec.proyecto_final.models.Giro;
import com.cibertec.proyecto_final.repositories.IGiroRepository;
import com.cibertec.proyecto_final.services.IGiroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GiroService implements IGiroService {

    private final IGiroRepository iGiroRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<Giro> obtenerGiros() {
        return objectMapper.convertValue(iGiroRepository.findAll(), new TypeReference<List<Giro>>() {});
    }

    @Override
    public Giro obtenerIdGiro(Long id) {
        return objectMapper.convertValue(iGiroRepository.findById(id).orElse(null), Giro.class);
    }

    @Override
    public Giro crearGiro(Giro giro) {
        GiroEntity giroEntity = objectMapper.convertValue(giro, GiroEntity.class);
        return objectMapper.convertValue(iGiroRepository.save(giroEntity), Giro.class);
    }

    @Override
    public Giro editarGiro(Long id, Giro giro) {
        if (iGiroRepository.existsById(id)) {
            GiroEntity giroEntity = objectMapper.convertValue(giro, GiroEntity.class);
            giroEntity.setId(id);
            return objectMapper.convertValue(iGiroRepository.save(giroEntity), Giro.class);
        }
        return null;
    }

    @Override
    public boolean eliminarGiro(Long id) {
        if (!iGiroRepository.existsById(id)) {
            return false;
        }
        iGiroRepository.deleteById(id);
        return true;
    }
}

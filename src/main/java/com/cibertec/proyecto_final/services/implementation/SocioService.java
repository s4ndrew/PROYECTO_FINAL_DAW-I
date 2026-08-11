package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.SocioEntity;
import com.cibertec.proyecto_final.models.Socio;
import com.cibertec.proyecto_final.repositories.ISocioRepository;
import com.cibertec.proyecto_final.services.ISocioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SocioService implements ISocioService {

    private final ISocioRepository iSocioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<Socio> obtenerSocios() {
        return objectMapper.convertValue(iSocioRepository.findAll(), new TypeReference<List<Socio>>() {}
        );
    }

    @Override
    public Socio obtenerIdSocio(Long id) {
        return objectMapper.convertValue(iSocioRepository.findById(id).orElse(null), Socio.class);
    }

    @Override
    public Socio crearSocio(Socio socio) {
        SocioEntity socioEntity =objectMapper.convertValue(socio, SocioEntity.class);
        return objectMapper.convertValue(iSocioRepository.save(socioEntity), Socio.class);
    }

    @Override
    public Socio editarSocio(Long id, Socio socio) {
        if (iSocioRepository.existsById(id)) {
            SocioEntity socioEntity = objectMapper.convertValue(socio, SocioEntity.class);
            socioEntity.setId(id);
            return objectMapper.convertValue(iSocioRepository.save(socioEntity), Socio.class);
        }
        return null;
    }

    @Override
    public boolean eliminarSocio(Long id) {
        if (!iSocioRepository.existsById(id)) {
            return false;
        }
        iSocioRepository.deleteById(id);
        return true;
    }
}

package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.ServicioEntity;
import com.cibertec.proyecto_final.models.Servicio;
import com.cibertec.proyecto_final.repositories.IServicioRepository;
import com.cibertec.proyecto_final.services.IServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class ServicioService implements IServicioService {

    private final IServicioRepository iServicioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<Servicio> listarTodos() {
        List<ServicioEntity> servicioEntityList = iServicioRepository.findAll();
        return servicioEntityList.stream()
                .map(servicioEntity -> objectMapper.convertValue(servicioEntity, Servicio.class))
                .toList();
    }

    @Override
    public Optional<Servicio> buscarPorId(Long id) {
        return iServicioRepository.findById(id)
                .map(servicioEntity -> objectMapper.convertValue(servicioEntity, Servicio.class));
    }

    @Override
    public Servicio guardar(Servicio servicio) {
        ServicioEntity servicioEntity = objectMapper.convertValue(servicio, ServicioEntity.class);
        return objectMapper.convertValue(iServicioRepository.save(servicioEntity),Servicio.class);
    }

    @Override
    public Servicio actualizar(Long id, Servicio servicio) {
        return iServicioRepository.findById(id)
                .map(e ->{
                    ServicioEntity servicioUpdate = objectMapper.convertValue(servicio, ServicioEntity.class);
                    return objectMapper.convertValue(iServicioRepository.save(servicioUpdate), Servicio.class);
                }).orElseThrow();
    }

    @Override
    public void eliminar(Long id) {
        iServicioRepository.deleteById(id);
    }

    @Override
    public List<Servicio> listarActivos() {
        List<ServicioEntity> servicioEntityList = iServicioRepository.findAll();
        return servicioEntityList.stream()
                .map(servicioEntity -> objectMapper.convertValue(servicioEntity, Servicio.class))
                .toList();
    }

    @Override
    public Servicio cambiarEstado(Long id, Boolean activo) {
        return iServicioRepository.findById(id)
                .map(e -> {
                    e.setEstado(activo);
                    return  objectMapper.convertValue(iServicioRepository.save(e), Servicio.class);
                }).orElseThrow();
    }
}

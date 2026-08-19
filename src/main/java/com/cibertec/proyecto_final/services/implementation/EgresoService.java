package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.BancoEntity;
import com.cibertec.proyecto_final.entities.EgresoEntity;
import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.Egreso;
import com.cibertec.proyecto_final.repositories.IEgresoRepository;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import com.cibertec.proyecto_final.services.IEgresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class EgresoService implements IEgresoService {

    private final ObjectMapper objectMapper;
    private final IEgresoRepository egresoRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IAuditoriaService auditoriaService;

    @Override
    public List<Egreso> listarEgresos() {
        return egresoRepository.findAll()
                .stream()
                .map(entity -> convertirAModelo(entity))
                .toList();
    }

    @Override
    public Egreso obtenerEgresoPorId(Long id) {
        EgresoEntity entity = egresoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Egreso no encontrado con id: " + id));
        return convertirAModelo(entity);
    }

    @Override
    public Egreso registrarEgreso(Egreso egreso) {
        EgresoEntity entity = convertirAEntidad(egreso);
        EgresoEntity guardado = egresoRepository.save(entity);
        if (guardado.getUsuario() != null) {
            auditoriaService.registrar(guardado.getUsuario().getId(), "Egreso", guardado.getId(), "REGISTRO",
                    "Egreso de " + guardado.getTotal() + " a " + guardado.getProveedor());
        }
        return convertirAModelo(guardado);
    }

    @Override
    public Egreso actualizarEgreso(Long id, Egreso egreso) {
        egresoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Egreso no encontrado con id: " + id));
        EgresoEntity entity = convertirAEntidad(egreso);
        entity.setId(id);
        EgresoEntity actualizado = egresoRepository.save(entity);
        return convertirAModelo(actualizado);
    }

    @Override
    public void eliminarEgreso(Long id, Long usuarioId) {
        egresoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Egreso no encontrado con id: " + id));
        egresoRepository.deleteById(id);
        auditoriaService.registrar(usuarioId, "Egreso", id, "ANULACION", "Se eliminó el egreso " + id);
    }

    @Override
    public List<Egreso> listarEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin) {
        return egresoRepository.findByFechaBetween(fechaInicio, fechaFin)
                .stream()
                .map(entity -> convertirAModelo(entity))
                .toList();
    }

    @Override
    public List<Egreso> listarEgresosPorCategoria(String categoria) {
        return egresoRepository.findByCategoria(categoria)
                .stream()
                .map(entity -> convertirAModelo(entity))
                .toList();
    }

    private Egreso convertirAModelo(EgresoEntity entity) {
        Egreso modelo = objectMapper.convertValue(entity, Egreso.class);
        if (entity.getBanco() != null) {
            modelo.setBancoId(entity.getBanco().getId());
        }
        if (entity.getUsuario() != null) {
            modelo.setUsuarioId(entity.getUsuario().getId());
        }
        return modelo;
    }

    private EgresoEntity convertirAEntidad(Egreso modelo) {
        EgresoEntity entity = objectMapper.convertValue(modelo, EgresoEntity.class);
        if (modelo.getBancoId() != null) {
            entity.setBanco(BancoEntity.builder().id(modelo.getBancoId()).build());
        }
        if (modelo.getUsuarioId() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(modelo.getUsuarioId())
                    .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
            entity.setUsuario(usuario);
        }
        return entity;
    }
}
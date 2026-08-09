package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.ComprobanteEgresoEntity;
import com.cibertec.proyecto_final.entities.EgresoEntity;
import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.ComprobanteEgreso;
import com.cibertec.proyecto_final.repositories.IComprobanteEgresoRepository;
import com.cibertec.proyecto_final.repositories.IEgresoRepository;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IComprobanteEgresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComprobanteEgresoService implements IComprobanteEgresoService {

    private final ObjectMapper objectMapper;
    private final IComprobanteEgresoRepository comprobanteEgresoRepository;
    private final IEgresoRepository egresoRepository;
    private final IUsuarioRepository usuarioRepository;

    @Override
    public List<ComprobanteEgreso> listarComprobantes() {
        return comprobanteEgresoRepository.findAll()
                .stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public ComprobanteEgreso obtenerComprobantePorId(Long id) {
        ComprobanteEgresoEntity entity = comprobanteEgresoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado con id: " + id));
        return convertirAModelo(entity);
    }

    @Override
    public ComprobanteEgreso registrarComprobante(ComprobanteEgreso comprobante) {
        ComprobanteEgresoEntity entity = convertirAEntidad(comprobante);
        entity.setEstado("EMITIDO");
        ComprobanteEgresoEntity guardado = comprobanteEgresoRepository.save(entity);
        return convertirAModelo(guardado);
    }

    @Override
    public List<ComprobanteEgreso> listarComprobantesPorMes(LocalDate fechaInicio, LocalDate fechaFin) {
        return comprobanteEgresoRepository.findByFechaEmisionBetween(fechaInicio, fechaFin)
                .stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public ComprobanteEgreso anularComprobante(Long id) {
        ComprobanteEgresoEntity entity = comprobanteEgresoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado con id: " + id));
        entity.setEstado("ANULADO");
        ComprobanteEgresoEntity actualizado = comprobanteEgresoRepository.save(entity);
        return convertirAModelo(actualizado);
    }

    @Override
    public ComprobanteEgreso procesarComprobante(Long id) {
        ComprobanteEgresoEntity entity = comprobanteEgresoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado con id: " + id));
        entity.setEstado("PROCESADO");
        ComprobanteEgresoEntity actualizado = comprobanteEgresoRepository.save(entity);
        return convertirAModelo(actualizado);
    }

    // --- Métodos privados de conversión ---

    private ComprobanteEgreso convertirAModelo(ComprobanteEgresoEntity entity) {
        ComprobanteEgreso modelo = objectMapper.convertValue(entity, ComprobanteEgreso.class);
        if (entity.getEgreso() != null) {
            modelo.setEgresoId(entity.getEgreso().getId());
        }
        if (entity.getUsuario() != null) {
            modelo.setUsuarioId(entity.getUsuario().getId());
        }
        return modelo;
    }

    private ComprobanteEgresoEntity convertirAEntidad(ComprobanteEgreso modelo) {
        ComprobanteEgresoEntity entity = objectMapper.convertValue(modelo, ComprobanteEgresoEntity.class);
        if (modelo.getEgresoId() != null) {
            EgresoEntity egreso = egresoRepository.findById(modelo.getEgresoId())
                    .orElseThrow(() -> new RuntimeException("Egreso no encontrado"));
            entity.setEgreso(egreso);
        }
        if (modelo.getUsuarioId() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(modelo.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            entity.setUsuario(usuario);
        }
        return entity;
    }
}
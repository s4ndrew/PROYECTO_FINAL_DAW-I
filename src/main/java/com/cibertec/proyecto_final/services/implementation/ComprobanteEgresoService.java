package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.ComprobanteEgresoEntity;
import com.cibertec.proyecto_final.entities.EgresoEntity;
import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.ComprobanteEgreso;
import com.cibertec.proyecto_final.repositories.IComprobanteEgresoRepository;
import com.cibertec.proyecto_final.repositories.IEgresoRepository;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import com.cibertec.proyecto_final.services.IComprobanteEgresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ComprobanteEgresoService implements IComprobanteEgresoService {

    private final ObjectMapper objectMapper;
    private final IComprobanteEgresoRepository comprobanteEgresoRepository;
    private final IEgresoRepository egresoRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IAuditoriaService auditoriaService;

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
                .orElseThrow(() -> new NoSuchElementException("Comprobante no encontrado con id: " + id));
        return convertirAModelo(entity);
    }

    @Override
    public ComprobanteEgreso registrarComprobante(ComprobanteEgreso comprobante) {
        ComprobanteEgresoEntity entity = convertirAEntidad(comprobante);
        entity.setEstado("EMITIDO");
        ComprobanteEgresoEntity guardado = comprobanteEgresoRepository.save(entity);
        // RNF-14: registro de comprobante auditado.
        if (guardado.getUsuario() != null) {
            auditoriaService.registrar(guardado.getUsuario().getId(), "ComprobanteEgreso", guardado.getId(),
                    "REGISTRO", "Comprobante " + guardado.getNumero() + " emitido");
        }
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
    public ComprobanteEgreso anularComprobante(Long id, Long usuarioId) {
        ComprobanteEgresoEntity entity = comprobanteEgresoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Comprobante no encontrado con id: " + id));
        entity.setEstado("ANULADO");
        ComprobanteEgresoEntity actualizado = comprobanteEgresoRepository.save(entity);
        // RNF-14: toda anulación queda auditada.
        auditoriaService.registrar(usuarioId, "ComprobanteEgreso", id, "ANULACION",
                "Se anuló el comprobante " + entity.getNumero());
        return convertirAModelo(actualizado);
    }

    @Override
    public ComprobanteEgreso procesarComprobante(Long id, Long usuarioId) {
        ComprobanteEgresoEntity entity = comprobanteEgresoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Comprobante no encontrado con id: " + id));
        entity.setEstado("PROCESADO");
        ComprobanteEgresoEntity actualizado = comprobanteEgresoRepository.save(entity);
        auditoriaService.registrar(usuarioId, "ComprobanteEgreso", id, "PROCESADO",
                "Se procesó el comprobante " + entity.getNumero());
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
                    .orElseThrow(() -> new NoSuchElementException("Egreso no encontrado"));
            entity.setEgreso(egreso);
        }
        if (modelo.getUsuarioId() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(modelo.getUsuarioId())
                    .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
            entity.setUsuario(usuario);
        }
        return entity;
    }
}
package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Auditoria;

import java.util.List;

public interface IAuditoriaService {
    void registrar(Long usuarioId, String entidad, Long entidadId, String accion, String detalle);
    List<Auditoria> listarTodas();
    List<Auditoria> listarPorEntidad(String entidad);
    List<Auditoria> listarPorUsuario(Long usuarioId);
}

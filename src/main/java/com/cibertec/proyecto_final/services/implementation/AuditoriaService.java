package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.AuditoriaEntity;
import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.Auditoria;
import com.cibertec.proyecto_final.repositories.IAuditoriaRepository;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaService implements IAuditoriaService {

    private final IAuditoriaRepository iAuditoriaRepository;
    private final IUsuarioRepository iUsuarioRepository;

    @Override
    public void registrar(Long usuarioId, String entidad, Long entidadId, String accion, String detalle) {
        UsuarioEntity usuario = iUsuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("El usuario " + usuarioId + " no existe"));

        AuditoriaEntity auditoria = AuditoriaEntity.builder()
                .usuario(usuario)
                .fecha(LocalDateTime.now())
                .entidad(entidad)
                .entidadId(entidadId)
                .accion(accion)
                .detalle(detalle)
                .build();
        iAuditoriaRepository.save(auditoria);
    }

    @Override
    public List<Auditoria> listarTodas() {
        return iAuditoriaRepository.findAll().stream().map(this::convertir).toList();
    }

    @Override
    public List<Auditoria> listarPorEntidad(String entidad) {
        return iAuditoriaRepository.findByEntidad(entidad).stream().map(this::convertir).toList();
    }

    @Override
    public List<Auditoria> listarPorUsuario(Long usuarioId) {
        return iAuditoriaRepository.findByUsuario_Id(usuarioId).stream().map(this::convertir).toList();
    }

    private Auditoria convertir(AuditoriaEntity entity) {
        return Auditoria.builder()
                .id(entity.getId())
                .usuarioId(entity.getUsuario().getId())
                .usuarioNombre(entity.getUsuario().getNombres() + " " + entity.getUsuario().getApellidos())
                .fecha(entity.getFecha())
                .entidad(entity.getEntidad())
                .entidadId(entity.getEntidadId())
                .accion(entity.getAccion())
                .detalle(entity.getDetalle())
                .build();
    }
}

package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.Usuario;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService implements IUsuarioService {

    private final IUsuarioRepository iUsuarioRepository;
    private final ObjectMapper objectMapper;


    @Override
    public List<Usuario> listarTodos() {
        List<UsuarioEntity> usuarioEntityList = iUsuarioRepository.findAll();
        return usuarioEntityList.stream()
                .map(e -> objectMapper.convertValue(e, Usuario.class))
                .toList();
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return iUsuarioRepository.findById(id)
                .map(e -> objectMapper.convertValue(e, Usuario.class));
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        UsuarioEntity usuarioEntity = objectMapper.convertValue(usuario,UsuarioEntity.class);
        return objectMapper.convertValue(iUsuarioRepository.save(usuarioEntity), Usuario.class);
    }

    @Override
    public Usuario actualizar(Long id, Usuario usuario) {
        return  iUsuarioRepository.findById(id)
                .map(entidadExistente -> {
                    UsuarioEntity entityToUpdate = objectMapper.convertValue(usuario, UsuarioEntity.class);
                    entityToUpdate.setId(id);
                    UsuarioEntity actualizada = iUsuarioRepository.save(entityToUpdate);
                    return objectMapper.convertValue(actualizada, Usuario.class);
                }).orElseThrow();

    }

    @Override
    public void elimar(Long id) {
        iUsuarioRepository.deleteById(id);
    }
}

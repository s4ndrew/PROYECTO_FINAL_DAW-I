package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.exceptions.CredencialesInvalidasException;
import com.cibertec.proyecto_final.models.LoginRequest;
import com.cibertec.proyecto_final.models.LoginResponse;
import com.cibertec.proyecto_final.models.Usuario;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.security.JwtService;
import com.cibertec.proyecto_final.services.IUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService implements IUsuarioService {

    private final IUsuarioRepository iUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Override
    public List<Usuario> listarTodos() {
        return iUsuarioRepository.findAll().stream()
                .map(this::convertirOcultandoPassword)
                .toList();
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return iUsuarioRepository.findById(id).map(this::convertirOcultandoPassword);
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException("El password es obligatorio al crear un usuario");
        }
        UsuarioEntity usuarioEntity = objectMapper.convertValue(usuario, UsuarioEntity.class);
        usuarioEntity.setId(null);
        // RF: password cifrado con BCryptPasswordEncoder, nunca en texto plano.
        usuarioEntity.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return convertirOcultandoPassword(iUsuarioRepository.save(usuarioEntity));
    }

    @Override
    public Usuario actualizar(Long id, Usuario usuario) {
        UsuarioEntity existente = iUsuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El usuario " + id + " no existe"));

        UsuarioEntity actualizado = objectMapper.convertValue(usuario, UsuarioEntity.class);
        actualizado.setId(id);
        // Si no mandan password nuevo, se conserva el hash que ya existía.
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            actualizado.setPassword(existente.getPassword());
        } else {
            actualizado.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return convertirOcultandoPassword(iUsuarioRepository.save(actualizado));
    }

    @Override
    public void eliminar(Long id) {
        if (!iUsuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario " + id + " no existe");
        }
        iUsuarioRepository.deleteById(id);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        UsuarioEntity usuario = iUsuarioRepository.findByUsuario(request.getUsuario())
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o password incorrectos"));

        if (!usuario.isActivo()) {
            throw new CredencialesInvalidasException("El usuario está inactivo");
        }
        // Nunca se compara texto plano contra texto plano: matches() valida contra el hash guardado.
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Usuario o password incorrectos");
        }

        String token = jwtService.generarToken(usuario.getUsuario(), usuario.getId(), usuario.getRol());
        return LoginResponse.builder()
                .token(token)
                .id(usuario.getId())
                .usuario(usuario.getUsuario())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .rol(usuario.getRol())
                .build();
    }

    private Usuario convertirOcultandoPassword(UsuarioEntity entity) {
        Usuario usuario = objectMapper.convertValue(entity, Usuario.class);
        usuario.setPassword(null);
        return usuario;
    }
}

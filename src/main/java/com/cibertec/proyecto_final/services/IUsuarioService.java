package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.LoginRequest;
import com.cibertec.proyecto_final.models.LoginResponse;
import com.cibertec.proyecto_final.models.Usuario;

import java.util.List;
import java.util.Optional;

public interface IUsuarioService {
    List<Usuario> listarTodos();
    Optional<Usuario> buscarPorId(Long id);
    Usuario guardar(Usuario usuario);
    Usuario actualizar(Long id, Usuario usuario);
    void eliminar(Long id);

    // RF-01: valida usuario/password (hash BCrypt) y devuelve el token JWT.
    LoginResponse login(LoginRequest request);
}

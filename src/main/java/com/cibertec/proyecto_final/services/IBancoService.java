package com.cibertec.proyecto_final.services;

import com.cibertec.proyecto_final.models.Banco;

import java.util.List;

public interface IBancoService {
    List<Banco> obtenerBancos();
    Banco obtenerIdBanco(Long id);
    Banco crearBanco(Banco banco);
    Banco editarBanco(Long id, Banco banco);
    boolean eliminarBanco(Long id);
}

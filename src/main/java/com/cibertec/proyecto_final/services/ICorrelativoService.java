package com.cibertec.proyecto_final.services;

public interface ICorrelativoService {
    // Devuelve el siguiente número disponible para ese tipo (INGRESO, EGRESO, BANCO).
    Long generarSiguiente(String tipo);
}

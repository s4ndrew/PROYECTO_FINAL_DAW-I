package com.cibertec.proyecto_final.exceptions;

/**
 * RF-01: se lanza solo cuando falla el login (usuario inexistente, password
 * incorrecto o usuario inactivo). Se separa de IllegalArgumentException para
 * que GlobalExceptionHandler pueda devolver 401 en vez de 400 en este caso
 * puntual (semántica HTTP correcta: "no autenticado", no "solicitud inválida").
 */
public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}

package com.greenbite.usuarios.dto;

import com.greenbite.usuarios.entity.Usuario;
import java.time.Instant;
import java.util.UUID;

/**
 * Representacion publica del usuario (sin el hash de contrasena).
 * Mantiene el mismo formato JSON que la version Node: id, nombre, email, createdAt.
 */
public record UserResponse(UUID id, String nombre, String email, Instant createdAt) {

    public static UserResponse from(Usuario usuario) {
        return new UserResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getCreatedAt());
    }
}

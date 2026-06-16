package com.greenbite.usuarios.dto;

/**
 * Respuesta de register/login: { user: {...}, token: "..." }.
 */
public record AuthResponse(UserResponse user, String token) {
}

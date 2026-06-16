package com.greenbite.usuarios.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.greenbite.usuarios.entity.Usuario;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("JwtService - pruebas unitarias")
class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test_secret_test_secret_test_secret_123456", 7200000L);

    @Test
    @DisplayName("generateToken: devuelve un JWT con 3 segmentos")
    void generateTokenOk() {
        Usuario user = new Usuario(UUID.randomUUID(), "Ana", "ana@greenbite.cl", "hash");

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }
}

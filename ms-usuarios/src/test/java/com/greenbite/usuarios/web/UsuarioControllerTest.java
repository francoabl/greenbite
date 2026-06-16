package com.greenbite.usuarios.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.greenbite.usuarios.dto.AuthResponse;
import com.greenbite.usuarios.dto.LoginRequest;
import com.greenbite.usuarios.dto.RegisterRequest;
import com.greenbite.usuarios.dto.UpdateRequest;
import com.greenbite.usuarios.dto.UserResponse;
import com.greenbite.usuarios.service.UsuarioService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioController - pruebas unitarias")
class UsuarioControllerTest {

    @Mock
    private UsuarioService service;

    @InjectMocks
    private UsuarioController controller;

    private UserResponse user(UUID id) {
        return new UserResponse(id, "Ana", "ana@greenbite.cl", Instant.now());
    }

    @Test
    @DisplayName("register: responde 201 con { user, token }")
    void register() {
        AuthResponse auth = new AuthResponse(user(UUID.randomUUID()), "jwt");
        when(service.register(any())).thenReturn(auth);

        ResponseEntity<AuthResponse> result =
                controller.register(new RegisterRequest("Ana", "ana@greenbite.cl", "secret"));

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isEqualTo(auth);
    }

    @Test
    @DisplayName("login: delega en el servicio")
    void login() {
        AuthResponse auth = new AuthResponse(user(UUID.randomUUID()), "jwt");
        when(service.login(any())).thenReturn(auth);

        assertThat(controller.login(new LoginRequest("ana@greenbite.cl", "secret"))).isEqualTo(auth);
    }

    @Test
    @DisplayName("list: envuelve los usuarios en { items }")
    void list() {
        when(service.list()).thenReturn(List.of(user(UUID.randomUUID())));

        Map<String, Object> body = controller.list();

        assertThat(body).containsKey("items");
        verify(service).list();
    }

    @Test
    @DisplayName("getById: delega en el servicio")
    void getById() {
        UUID id = UUID.randomUUID();
        UserResponse resp = user(id);
        when(service.getById(id)).thenReturn(resp);

        assertThat(controller.getById(id)).isEqualTo(resp);
    }

    @Test
    @DisplayName("update: delega en el servicio")
    void update() {
        UUID id = UUID.randomUUID();
        UserResponse resp = user(id);
        when(service.update(eq(id), any())).thenReturn(resp);

        assertThat(controller.update(id, new UpdateRequest("Ana", null, null))).isEqualTo(resp);
    }

    @Test
    @DisplayName("remove: responde { ok: true }")
    void remove() {
        UUID id = UUID.randomUUID();

        Map<String, Object> body = controller.remove(id);

        assertThat(body).containsEntry("ok", true);
        verify(service).remove(id);
    }

    @Test
    @DisplayName("health: responde status ok")
    void health() {
        assertThat(new HealthController().health()).containsEntry("status", "ok");
    }
}

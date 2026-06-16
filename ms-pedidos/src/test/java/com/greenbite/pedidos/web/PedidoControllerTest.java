package com.greenbite.pedidos.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.greenbite.pedidos.dto.CreatePedidoRequest;
import com.greenbite.pedidos.dto.PedidoResponse;
import com.greenbite.pedidos.dto.UpdatePedidoRequest;
import com.greenbite.pedidos.service.PedidoService;
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
@DisplayName("PedidoController - pruebas unitarias")
class PedidoControllerTest {

    @Mock
    private PedidoService service;

    @InjectMocks
    private PedidoController controller;

    private PedidoResponse sample(UUID id, UUID userId) {
        return new PedidoResponse(id, userId, 2, "PENDIENTE", 32990, Instant.now());
    }

    @Test
    @DisplayName("create: responde 201 con el pedido creado")
    void create() {
        UUID userId = UUID.randomUUID();
        PedidoResponse resp = sample(UUID.randomUUID(), userId);
        when(service.create(any())).thenReturn(resp);

        ResponseEntity<PedidoResponse> result = controller.create(new CreatePedidoRequest(userId, 2));

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isEqualTo(resp);
    }

    @Test
    @DisplayName("list: envuelve los pedidos en { items }")
    void list() {
        UUID userId = UUID.randomUUID();
        when(service.list(userId)).thenReturn(List.of(sample(UUID.randomUUID(), userId)));

        Map<String, Object> body = controller.list(userId);

        assertThat(body).containsKey("items");
        verify(service).list(userId);
    }

    @Test
    @DisplayName("getById: delega en el servicio")
    void getById() {
        UUID id = UUID.randomUUID();
        PedidoResponse resp = sample(id, UUID.randomUUID());
        when(service.getById(id)).thenReturn(resp);

        assertThat(controller.getById(id)).isEqualTo(resp);
    }

    @Test
    @DisplayName("update: delega en el servicio")
    void update() {
        UUID id = UUID.randomUUID();
        PedidoResponse resp = sample(id, UUID.randomUUID());
        when(service.update(eq(id), any())).thenReturn(resp);

        assertThat(controller.update(id, new UpdatePedidoRequest("CONFIRMADO", null))).isEqualTo(resp);
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

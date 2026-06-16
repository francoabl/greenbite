package com.greenbite.pedidos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.greenbite.pedidos.dto.CreatePedidoRequest;
import com.greenbite.pedidos.dto.PedidoResponse;
import com.greenbite.pedidos.dto.UpdatePedidoRequest;
import com.greenbite.pedidos.entity.Pedido;
import com.greenbite.pedidos.exception.ApiException;
import com.greenbite.pedidos.repository.PedidoRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
@DisplayName("PedidoService - pruebas unitarias")
class PedidoServiceTest {

    @Mock
    private PedidoRepository repository;

    @InjectMocks
    private PedidoService service;

    private UUID userId;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        pedido = new Pedido(UUID.randomUUID(), userId, 2, "PENDIENTE", 32990);
        pedido.setCreatedAt(Instant.now());
    }

    @Test
    @DisplayName("create: plan valido calcula el total y queda PENDIENTE")
    void createOk() {
        when(repository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));
        CreatePedidoRequest req = new CreatePedidoRequest(userId, 4);

        PedidoResponse result = service.create(req);

        assertThat(result.total()).isEqualTo(59990);
        assertThat(result.status()).isEqualTo("PENDIENTE");
        assertThat(result.plan()).isEqualTo(4);
        assertThat(result.userId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("create: campos faltantes lanza 400")
    void createMissingFields() {
        CreatePedidoRequest req = new CreatePedidoRequest(null, 1);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("create: plan inexistente lanza 400")
    void createInvalidPlan() {
        CreatePedidoRequest req = new CreatePedidoRequest(userId, 3);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("list: con userId filtra por usuario")
    void listByUser() {
        when(repository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(pedido));

        List<PedidoResponse> result = service.list(userId);

        assertThat(result).hasSize(1);
        verify(repository).findByUserIdOrderByCreatedAtDesc(userId);
        verify(repository, never()).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("list: sin userId devuelve todos")
    void listAll() {
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(pedido));

        List<PedidoResponse> result = service.list(null);

        assertThat(result).hasSize(1);
        verify(repository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("getById: existente devuelve el pedido")
    void getByIdOk() {
        when(repository.findById(pedido.getId())).thenReturn(Optional.of(pedido));

        PedidoResponse result = service.getById(pedido.getId());

        assertThat(result.id()).isEqualTo(pedido.getId());
    }

    @Test
    @DisplayName("getById: inexistente lanza 404")
    void getByIdNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("update: cambia el status")
    void updateStatus() {
        when(repository.findById(pedido.getId())).thenReturn(Optional.of(pedido));
        when(repository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        PedidoResponse result = service.update(pedido.getId(), new UpdatePedidoRequest("CONFIRMADO", null));

        assertThat(result.status()).isEqualTo("CONFIRMADO");
        assertThat(result.total()).isEqualTo(32990);
    }

    @Test
    @DisplayName("update: cambia el plan y recalcula el total")
    void updatePlan() {
        when(repository.findById(pedido.getId())).thenReturn(Optional.of(pedido));
        when(repository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        PedidoResponse result = service.update(pedido.getId(), new UpdatePedidoRequest(null, 1));

        assertThat(result.plan()).isEqualTo(1);
        assertThat(result.total()).isEqualTo(18990);
    }

    @Test
    @DisplayName("update: plan invalido lanza 400")
    void updateInvalidPlan() {
        when(repository.findById(pedido.getId())).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> service.update(pedido.getId(), new UpdatePedidoRequest(null, 99)))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("update: inexistente lanza 404")
    void updateNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, new UpdatePedidoRequest("X", null)))
                .isInstanceOf(ApiException.class);
    }

    @Test
    @DisplayName("remove: existente elimina")
    void removeOk() {
        when(repository.existsById(pedido.getId())).thenReturn(true);

        service.remove(pedido.getId());

        verify(repository).deleteById(pedido.getId());
    }

    @Test
    @DisplayName("remove: inexistente lanza 404")
    void removeNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.remove(id))
                .isInstanceOf(ApiException.class);
        verify(repository, never()).deleteById(any());
    }
}

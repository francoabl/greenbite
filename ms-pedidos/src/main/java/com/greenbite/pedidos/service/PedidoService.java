package com.greenbite.pedidos.service;

import com.greenbite.pedidos.dto.CreatePedidoRequest;
import com.greenbite.pedidos.dto.PedidoResponse;
import com.greenbite.pedidos.dto.UpdatePedidoRequest;
import com.greenbite.pedidos.entity.Pedido;
import com.greenbite.pedidos.exception.ApiException;
import com.greenbite.pedidos.repository.PedidoRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Logica de negocio de pedidos. Reproduce el comportamiento del
 * pedidos.service.js original (precios por plan, validaciones, errores HTTP).
 */
@Service
public class PedidoService {

    /** Precios por plan (cantidad de semanas) en CLP. */
    private static final Map<Integer, Integer> PLAN_PRICES = Map.of(
            1, 18990,
            2, 32990,
            4, 59990);

    private static final String STATUS_PENDIENTE = "PENDIENTE";

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    private int getTotal(Integer plan) {
        Integer total = PLAN_PRICES.get(plan);
        if (total == null) {
            throw ApiException.badRequest("Plan invalido");
        }
        return total;
    }

    public PedidoResponse create(CreatePedidoRequest payload) {
        if (payload.userId() == null || payload.plan() == null) {
            throw ApiException.badRequest("userId y plan son obligatorios");
        }
        int total = getTotal(payload.plan());

        Pedido pedido = new Pedido(
                UUID.randomUUID(),
                payload.userId(),
                payload.plan(),
                STATUS_PENDIENTE,
                total);

        return PedidoResponse.from(repository.save(pedido));
    }

    public List<PedidoResponse> list(UUID userId) {
        List<Pedido> pedidos = (userId != null)
                ? repository.findByUserIdOrderByCreatedAtDesc(userId)
                : repository.findAllByOrderByCreatedAtDesc();
        return pedidos.stream().map(PedidoResponse::from).toList();
    }

    public PedidoResponse getById(UUID id) {
        Pedido pedido = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pedido no encontrado"));
        return PedidoResponse.from(pedido);
    }

    public PedidoResponse update(UUID id, UpdatePedidoRequest payload) {
        Pedido pedido = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pedido no encontrado"));

        if (payload.status() != null && !payload.status().isBlank()) {
            pedido.setStatus(payload.status());
        }
        if (payload.plan() != null) {
            pedido.setPlan(payload.plan());
            pedido.setTotal(getTotal(payload.plan()));
        }

        return PedidoResponse.from(repository.save(pedido));
    }

    public void remove(UUID id) {
        if (!repository.existsById(id)) {
            throw ApiException.notFound("Pedido no encontrado");
        }
        repository.deleteById(id);
    }
}

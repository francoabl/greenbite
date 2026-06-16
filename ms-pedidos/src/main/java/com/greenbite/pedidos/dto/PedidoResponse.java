package com.greenbite.pedidos.dto;

import com.greenbite.pedidos.entity.Pedido;
import java.time.Instant;
import java.util.UUID;

/**
 * Formato JSON identico al de la version Node: id, userId, plan, status, total, createdAt.
 */
public record PedidoResponse(UUID id, UUID userId, Integer plan, String status, Integer total, Instant createdAt) {

    public static PedidoResponse from(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getUserId(),
                pedido.getPlan(),
                pedido.getStatus(),
                pedido.getTotal(),
                pedido.getCreatedAt());
    }
}

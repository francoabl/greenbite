package com.greenbite.pedidos.dto;

import java.util.UUID;

public record CreatePedidoRequest(UUID userId, Integer plan) {
}

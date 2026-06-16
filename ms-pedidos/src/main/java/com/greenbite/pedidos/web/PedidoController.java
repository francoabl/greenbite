package com.greenbite.pedidos.web;

import com.greenbite.pedidos.dto.CreatePedidoRequest;
import com.greenbite.pedidos.dto.PedidoResponse;
import com.greenbite.pedidos.dto.UpdatePedidoRequest;
import com.greenbite.pedidos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST de pedidos. Mantiene las mismas rutas y formatos de respuesta que
 * el microservicio Node original, para que el BFF siga funcionando sin cambios.
 */
@RestController
@RequestMapping("/pedidos")
@Tag(name = "Pedidos", description = "Registro y gestión de suscripciones (pedidos)")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @Operation(summary = "Crear pedido", description = "Crea un pedido en estado PENDIENTE; el total se calcula según el plan (1, 2 o 4).")
    @PostMapping
    public ResponseEntity<PedidoResponse> create(@RequestBody CreatePedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @Operation(summary = "Listar pedidos", description = "Lista los pedidos; si se indica userId, filtra por ese usuario.")
    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) UUID userId) {
        return Map.of("items", service.list(userId));
    }

    @Operation(summary = "Obtener pedido por id")
    @GetMapping("/{id}")
    public PedidoResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "Actualizar pedido", description = "Actualiza el estado y/o el plan (recalcula el total).")
    @PutMapping("/{id}")
    public PedidoResponse update(@PathVariable UUID id, @RequestBody UpdatePedidoRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Eliminar pedido")
    @DeleteMapping("/{id}")
    public Map<String, Object> remove(@PathVariable UUID id) {
        service.remove(id);
        return Map.of("ok", true);
    }
}

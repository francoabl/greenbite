package com.greenbite.pedidos.repository;

import com.greenbite.pedidos.entity.Pedido;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    List<Pedido> findAllByOrderByCreatedAtDesc();

    List<Pedido> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

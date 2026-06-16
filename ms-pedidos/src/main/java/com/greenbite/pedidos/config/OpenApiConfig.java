package com.greenbite.pedidos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadatos de la documentacion OpenAPI / Swagger UI.
 * Swagger UI disponible en: http://localhost:4002/swagger-ui.html
 * Especificacion JSON en:   http://localhost:4002/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI pedidosOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("GreenBite - MS Pedidos API")
                .description("Microservicio de registro y gestión de suscripciones (pedidos). "
                        + "Persistencia con JPA/Hibernate sobre PostgreSQL (pedidos_db).")
                .version("1.0.0")
                .contact(new Contact().name("Equipo GreenBite").email("equipo@greenbite.cl"))
                .license(new License().name("Uso académico - DUOC UC")));
    }
}

package com.greenbite.usuarios.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadatos de la documentacion OpenAPI / Swagger UI.
 * Swagger UI disponible en: http://localhost:4001/swagger-ui.html
 * Especificacion JSON en:   http://localhost:4001/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI usuariosOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("GreenBite - MS Usuarios API")
                .description("Microservicio de autenticación y gestión de usuarios. "
                        + "Persistencia con JPA/Hibernate sobre PostgreSQL (usuarios_db).")
                .version("1.0.0")
                .contact(new Contact().name("Equipo GreenBite").email("equipo@greenbite.cl"))
                .license(new License().name("Uso académico - DUOC UC")));
    }
}

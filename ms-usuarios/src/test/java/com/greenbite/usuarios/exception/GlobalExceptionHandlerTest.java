package com.greenbite.usuarios.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@DisplayName("GlobalExceptionHandler - pruebas unitarias")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("ApiException se traduce a su codigo HTTP y mensaje")
    void apiException() {
        ResponseEntity<Map<String, Object>> resp =
                handler.handleApiException(ApiException.conflict("Email ya registrado"));

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(resp.getBody()).containsEntry("message", "Email ya registrado");
        assertThat(resp.getBody()).containsKey("error");
    }

    @Test
    @DisplayName("Excepcion generica se traduce a 500")
    void generic() {
        ResponseEntity<Map<String, Object>> resp = handler.handleGeneric(new RuntimeException("x"));

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(resp.getBody()).containsEntry("message", "Error inesperado");
    }
}

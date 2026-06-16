package com.greenbite.usuarios.web;

import com.greenbite.usuarios.dto.AuthResponse;
import com.greenbite.usuarios.dto.LoginRequest;
import com.greenbite.usuarios.dto.RegisterRequest;
import com.greenbite.usuarios.dto.UpdateRequest;
import com.greenbite.usuarios.dto.UserResponse;
import com.greenbite.usuarios.service.UsuarioService;
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
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST de usuarios. Mantiene las mismas rutas y formatos de respuesta que
 * el microservicio Node original, para que el BFF siga funcionando sin cambios.
 */
@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuarios", description = "Autenticación y gestión de usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @Operation(summary = "Registrar un nuevo usuario", description = "Crea el usuario y devuelve sus datos junto con un token JWT.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
    }

    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y devuelve los datos del usuario y un token JWT.")
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return service.login(request);
    }

    @Operation(summary = "Listar usuarios", description = "Devuelve todos los usuarios ordenados por fecha de creación.")
    @GetMapping
    public Map<String, Object> list() {
        return Map.of("items", service.list());
    }

    @Operation(summary = "Obtener usuario por id")
    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "Actualizar usuario", description = "Actualiza nombre, email y/o contraseña.")
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable UUID id, @RequestBody UpdateRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Eliminar usuario")
    @DeleteMapping("/{id}")
    public Map<String, Object> remove(@PathVariable UUID id) {
        service.remove(id);
        return Map.of("ok", true);
    }
}

package com.greenbite.usuarios.service;

import com.greenbite.usuarios.dto.AuthResponse;
import com.greenbite.usuarios.dto.LoginRequest;
import com.greenbite.usuarios.dto.RegisterRequest;
import com.greenbite.usuarios.dto.UpdateRequest;
import com.greenbite.usuarios.dto.UserResponse;
import com.greenbite.usuarios.entity.Usuario;
import com.greenbite.usuarios.exception.ApiException;
import com.greenbite.usuarios.repository.UsuarioRepository;
import com.greenbite.usuarios.security.JwtService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Logica de negocio de usuarios. Reproduce el comportamiento del
 * usuarios.service.js original (validaciones, hashing, JWT, errores HTTP).
 */
@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest payload) {
        if (isBlank(payload.nombre()) || isBlank(payload.email()) || isBlank(payload.password())) {
            throw ApiException.badRequest("nombre, email y password son obligatorios");
        }
        if (repository.existsByEmail(payload.email())) {
            throw ApiException.conflict("Email ya registrado");
        }

        Usuario usuario = new Usuario(
                UUID.randomUUID(),
                payload.nombre(),
                payload.email(),
                passwordEncoder.encode(payload.password()));

        Usuario saved = repository.save(usuario);
        return new AuthResponse(UserResponse.from(saved), jwtService.generateToken(saved));
    }

    public AuthResponse login(LoginRequest payload) {
        if (isBlank(payload.email()) || isBlank(payload.password())) {
            throw ApiException.badRequest("email y password son obligatorios");
        }

        Usuario usuario = repository.findByEmail(payload.email())
                .orElseThrow(() -> ApiException.unauthorized("Credenciales invalidas"));

        if (!passwordEncoder.matches(payload.password(), usuario.getPasswordHash())) {
            throw ApiException.unauthorized("Credenciales invalidas");
        }

        return new AuthResponse(UserResponse.from(usuario), jwtService.generateToken(usuario));
    }

    public List<UserResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getById(UUID id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));
        return UserResponse.from(usuario);
    }

    public UserResponse update(UUID id, UpdateRequest payload) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));

        if (!isBlank(payload.nombre())) {
            usuario.setNombre(payload.nombre());
        }
        if (!isBlank(payload.email())) {
            usuario.setEmail(payload.email());
        }
        if (!isBlank(payload.password())) {
            usuario.setPasswordHash(passwordEncoder.encode(payload.password()));
        }

        return UserResponse.from(repository.save(usuario));
    }

    public void remove(UUID id) {
        if (!repository.existsById(id)) {
            throw ApiException.notFound("Usuario no encontrado");
        }
        repository.deleteById(id);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

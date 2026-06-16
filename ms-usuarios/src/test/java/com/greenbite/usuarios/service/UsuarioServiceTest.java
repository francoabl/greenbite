package com.greenbite.usuarios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.greenbite.usuarios.dto.AuthResponse;
import com.greenbite.usuarios.dto.LoginRequest;
import com.greenbite.usuarios.dto.RegisterRequest;
import com.greenbite.usuarios.dto.UpdateRequest;
import com.greenbite.usuarios.dto.UserResponse;
import com.greenbite.usuarios.entity.Usuario;
import com.greenbite.usuarios.exception.ApiException;
import com.greenbite.usuarios.repository.UsuarioRepository;
import com.greenbite.usuarios.security.JwtService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - pruebas unitarias")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario(UUID.randomUUID(), "Ana", "ana@greenbite.cl", "hash");
        usuario.setCreatedAt(Instant.now());
    }

    @Test
    @DisplayName("register: crea usuario, hashea password y devuelve token")
    void registerOk() {
        RegisterRequest req = new RegisterRequest("Ana", "ana@greenbite.cl", "secret");
        when(repository.existsByEmail("ana@greenbite.cl")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hash");
        when(repository.save(any(Usuario.class))).thenReturn(usuario);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token");

        AuthResponse result = service.register(req);

        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().email()).isEqualTo("ana@greenbite.cl");
        verify(passwordEncoder).encode("secret");
        verify(repository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("register: campos faltantes lanza 400")
    void registerMissingFields() {
        RegisterRequest req = new RegisterRequest("Ana", "", "secret");

        assertThatThrownBy(() -> service.register(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("register: email duplicado lanza 409")
    void registerDuplicateEmail() {
        RegisterRequest req = new RegisterRequest("Ana", "ana@greenbite.cl", "secret");
        when(repository.existsByEmail("ana@greenbite.cl")).thenReturn(true);

        assertThatThrownBy(() -> service.register(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("login: credenciales correctas devuelve token")
    void loginOk() {
        LoginRequest req = new LoginRequest("ana@greenbite.cl", "secret");
        when(repository.findByEmail("ana@greenbite.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token");

        AuthResponse result = service.login(req);

        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().nombre()).isEqualTo("Ana");
    }

    @Test
    @DisplayName("login: usuario inexistente lanza 401")
    void loginUserNotFound() {
        LoginRequest req = new LoginRequest("nadie@greenbite.cl", "secret");
        when(repository.findByEmail("nadie@greenbite.cl")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("login: password incorrecta lanza 401")
    void loginWrongPassword() {
        LoginRequest req = new LoginRequest("ana@greenbite.cl", "mala");
        when(repository.findByEmail("ana@greenbite.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(req))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("list: devuelve los usuarios mapeados")
    void listOk() {
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(usuario));

        List<UserResponse> result = service.list();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("ana@greenbite.cl");
    }

    @Test
    @DisplayName("getById: existente devuelve el usuario")
    void getByIdOk() {
        when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));

        UserResponse result = service.getById(usuario.getId());

        assertThat(result.id()).isEqualTo(usuario.getId());
    }

    @Test
    @DisplayName("getById: inexistente lanza 404")
    void getByIdNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("update: cambia nombre y email")
    void updateOk() {
        when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        UpdateRequest req = new UpdateRequest("Ana Maria", "anam@greenbite.cl", null);

        UserResponse result = service.update(usuario.getId(), req);

        assertThat(result.nombre()).isEqualTo("Ana Maria");
        assertThat(result.email()).isEqualTo("anam@greenbite.cl");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("update: con password rehashea")
    void updateWithPassword() {
        when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passwordEncoder.encode("nueva")).thenReturn("nuevo-hash");
        UpdateRequest req = new UpdateRequest(null, null, "nueva");

        service.update(usuario.getId(), req);

        verify(passwordEncoder).encode("nueva");
        assertThat(usuario.getPasswordHash()).isEqualTo("nuevo-hash");
    }

    @Test
    @DisplayName("update: inexistente lanza 404")
    void updateNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, new UpdateRequest("x", null, null)))
                .isInstanceOf(ApiException.class);
    }

    @Test
    @DisplayName("remove: existente elimina")
    void removeOk() {
        when(repository.existsById(usuario.getId())).thenReturn(true);

        service.remove(usuario.getId());

        verify(repository).deleteById(usuario.getId());
    }

    @Test
    @DisplayName("remove: inexistente lanza 404")
    void removeNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.remove(id))
                .isInstanceOf(ApiException.class);
        verify(repository, never()).deleteById(any());
    }
}

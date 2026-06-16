# Documentación del proyecto GreenBite

Índice de entregables y documentación técnica.

## Entregables de la Evaluación Parcial N°3

| Entregable | Archivo |
|---|---|
| 🗺️ Diagrama de arquitectura de microservicios | [diagrama-arquitectura.png](diagrama-arquitectura.png) · [PDF](diagrama-arquitectura.pdf) |
| 🗄️ Informe de persistencia de datos (JPA) | [informe-persistencia.pdf](informe-persistencia.pdf) |
| 🧪 Informe de pruebas unitarias (cobertura y métricas) | [informe-pruebas-unitarias.pdf](informe-pruebas-unitarias.pdf) |
| 📑 Documentación de la API REST (Swagger / OpenAPI) | [api/README.md](api/README.md) |
| 🧩 Análisis de patrones y arquitectura | [analisis-patrones.md](analisis-patrones.md) |
| 🔗 Enlaces a repositorios GitHub | [repositorios.txt](repositorios.txt) |

## Otros documentos
- [plan-branching.md](plan-branching.md) — estrategia de ramas Git.
- [presentacion-cheatsheet.md](presentacion-cheatsheet.md) — apuntes para la defensa oral.

## Reproducir los artefactos generados
Los diagramas y los informes PDF se generan con scripts de Python (carpeta `_scripts/`):

```bash
pip install reportlab matplotlib
python docs/_scripts/gen_diagrama.py            # diagrama de arquitectura
python docs/_scripts/gen_informe_pruebas.py     # informe de pruebas (lee JaCoCo)
python docs/_scripts/gen_informe_persistencia.py
```

> El informe de pruebas lee las métricas reales desde
> `ms-*/target/site/jacoco/jacoco.csv`, así que primero ejecuta
> `mvnw test` en cada microservicio.

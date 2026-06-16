"""Genera el diagrama de arquitectura de microservicios de GreenBite.
Salida: docs/diagrama-arquitectura.png y docs/diagrama-arquitectura.pdf
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]  # docs/

LEAF = "#1f5c3b"
CLAY = "#c36b3c"
NODE = "#3b7dd8"
JAVA = "#d97706"
DB = "#4b5563"
INK = "#1c1b1a"
BG_CARD = "#fffdfa"

fig, ax = plt.subplots(figsize=(11, 8.5))
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis("off")
fig.patch.set_facecolor("white")


def box(x, y, w, h, title, lines, edge, title_color=None):
    ax.add_patch(FancyBboxPatch(
        (x, y), w, h, boxstyle="round,pad=0.6,rounding_size=2",
        linewidth=2, edgecolor=edge, facecolor=BG_CARD, zorder=2))
    ax.text(x + w / 2, y + h - 4.2, title, ha="center", va="top",
            fontsize=12, fontweight="bold", color=title_color or edge, zorder=3)
    ax.text(x + w / 2, y + h - 9.5, "\n".join(lines), ha="center", va="top",
            fontsize=9, color=INK, zorder=3)


def arrow(x1, y1, x2, y2, label="", color=INK, off=2.2):
    ax.add_patch(FancyArrowPatch(
        (x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=18,
        linewidth=1.8, color=color, zorder=1,
        shrinkA=2, shrinkB=2))
    if label:
        ax.text((x1 + x2) / 2 + off, (y1 + y2) / 2, label, ha="left", va="center",
                fontsize=8, color=color, style="italic", zorder=4,
                bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none", alpha=0.85))


# Titulo
ax.text(50, 97, "GreenBite — Arquitectura de Microservicios", ha="center",
        fontsize=16, fontweight="bold", color=LEAF)
ax.text(50, 93, "Frontend  ·  BFF  ·  API REST  ·  Persistencia por servicio (Database per Service)",
        ha="center", fontsize=10, color=INK)

# Frontend (arriba centro)
box(36, 80, 28, 11, "Frontend", ["React + Vite", "Puerto 5173"], NODE)

# BFF (centro)
box(36, 58, 28, 12, "BFF", ["Node.js + Express", "Orquestador / Proxy", "Puerto 4000"], CLAY)

# Microservicios
box(6, 32, 30, 13, "MS Usuarios", ["Java 17 + Spring Boot", "Auth JWT + BCrypt", "Puerto 4001"], JAVA)
box(64, 32, 30, 13, "MS Pedidos", ["Java 17 + Spring Boot", "Logica de planes", "Puerto 4002"], JAVA)

# Bases de datos
box(6, 8, 30, 12, "usuarios_db", ["PostgreSQL", "Puerto 5433"], DB)
box(64, 8, 30, 12, "pedidos_db", ["PostgreSQL", "Puerto 5434"], DB)

# Flechas
arrow(50, 80, 50, 70.5, "HTTP REST (Axios)\n+ JWT Bearer", LEAF)
arrow(44, 58, 28, 45.5, "HTTP REST", CLAY, off=-12)
arrow(56, 58, 72, 45.5, "HTTP REST", CLAY, off=2)
arrow(21, 32, 21, 20.5, "JPA / Hibernate", JAVA, off=2)
arrow(79, 32, 79, 20.5, "JPA / Hibernate", JAVA, off=2)

# Nota Swagger
ax.text(50, 27, "Cada microservicio documenta su API con Swagger / OpenAPI (springdoc)",
        ha="center", fontsize=8.5, color=DB, style="italic")

# Leyenda de tecnologias
ax.text(50, 2.5, "React (frontend)  +  Node.js/Express (BFF)  +  Java/Spring Boot (microservicios)  —  integrados por API REST",
        ha="center", fontsize=8.5, color=INK)

plt.tight_layout()
fig.savefig(OUT / "diagrama-arquitectura.png", dpi=160, bbox_inches="tight", facecolor="white")
fig.savefig(OUT / "diagrama-arquitectura.pdf", bbox_inches="tight", facecolor="white")
print("OK ->", OUT / "diagrama-arquitectura.png")
print("OK ->", OUT / "diagrama-arquitectura.pdf")

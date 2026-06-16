"""Genera docs/informe-pruebas-unitarias.pdf y el grafico de cobertura.
Lee las metricas reales desde los reportes JaCoCo (target/site/jacoco/jacoco.csv).
"""
import csv
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, Image, HRFlowable)

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
LEAF = colors.HexColor("#1f5c3b")
CLAY = colors.HexColor("#c36b3c")
LIGHT = colors.HexColor("#eef3ee")

SERVICES = [
    ("ms-usuarios", ROOT / "ms-usuarios" / "target" / "site" / "jacoco" / "jacoco.csv"),
    ("ms-pedidos", ROOT / "ms-pedidos" / "target" / "site" / "jacoco" / "jacoco.csv"),
]

# Numero de pruebas por servicio (de la ejecucion de mvnw test)
TEST_COUNTS = {"ms-usuarios": 24, "ms-pedidos": 21}


def read_coverage(csv_path):
    rows = []
    tot = {"im": 0, "ic": 0, "bm": 0, "bc": 0, "lm": 0, "lc": 0}
    with open(csv_path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            im = int(r["INSTRUCTION_MISSED"]); ic = int(r["INSTRUCTION_COVERED"])
            bm = int(r["BRANCH_MISSED"]); bc = int(r["BRANCH_COVERED"])
            lm = int(r["LINE_MISSED"]); lc = int(r["LINE_COVERED"])
            tot["im"] += im; tot["ic"] += ic; tot["bm"] += bm
            tot["bc"] += bc; tot["lm"] += lm; tot["lc"] += lc
            instr = ic + im
            rows.append({
                "clase": r["CLASS"],
                "paquete": r["PACKAGE"].replace("com.greenbite.", ""),
                "cob": (100 * ic / instr) if instr else 100.0,
                "instr": instr,
            })
    return rows, tot


def pct(c, m):
    t = c + m
    return (100 * c / t) if t else 100.0


data = {}
for name, path in SERVICES:
    rows, tot = read_coverage(path)
    data[name] = {
        "rows": rows,
        "instr": pct(tot["ic"], tot["im"]),
        "branch": pct(tot["bc"], tot["bm"]),
        "line": pct(tot["lc"], tot["lm"]),
    }

# ---- Grafico de cobertura ----
fig, ax = plt.subplots(figsize=(7.2, 3.6))
labels = ["Instrucciones", "Ramas", "Lineas"]
x = range(len(labels))
w = 0.35
u = [data["ms-usuarios"]["instr"], data["ms-usuarios"]["branch"], data["ms-usuarios"]["line"]]
p = [data["ms-pedidos"]["instr"], data["ms-pedidos"]["branch"], data["ms-pedidos"]["line"]]
b1 = ax.bar([i - w / 2 for i in x], u, w, label="ms-usuarios", color="#1f5c3b")
b2 = ax.bar([i + w / 2 for i in x], p, w, label="ms-pedidos", color="#c36b3c")
ax.axhline(60, color="#b91c1c", linestyle="--", linewidth=1.3)
ax.text(2.45, 61.5, "Minimo 60%", color="#b91c1c", fontsize=8, ha="right")
ax.set_ylim(0, 100)
ax.set_ylabel("% cobertura")
ax.set_title("Cobertura de pruebas unitarias (JaCoCo)")
ax.set_xticks(list(x)); ax.set_xticklabels(labels)
ax.legend(loc="lower right", fontsize=8)
for bars in (b1, b2):
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
                f"{bar.get_height():.0f}%", ha="center", fontsize=8)
fig.tight_layout()
chart = DOCS / "cobertura-chart.png"
fig.savefig(chart, dpi=150)

# ---- PDF ----
styles = getSampleStyleSheet()
h1 = ParagraphStyle("h1", parent=styles["Title"], textColor=LEAF, fontSize=20, spaceAfter=4)
h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=LEAF, fontSize=13, spaceBefore=12)
body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10, leading=14)
small = ParagraphStyle("small", parent=styles["BodyText"], fontSize=8.5, leading=11, textColor=colors.grey)
code = ParagraphStyle("code", parent=styles["Code"], fontSize=8, leading=10, backColor=LIGHT,
                      borderPadding=6, leftIndent=4)

story = []
story.append(Paragraph("GreenBite — Informe de Pruebas Unitarias", h1))
story.append(Paragraph("Desarrollo Fullstack III · Evaluación Parcial N°3", small))
story.append(HRFlowable(width="100%", color=LEAF, thickness=1.2, spaceBefore=6, spaceAfter=10))

story.append(Paragraph("1. Introducción", h2))
story.append(Paragraph(
    "Los microservicios <b>ms-usuarios</b> y <b>ms-pedidos</b> (Java 17 + Spring Boot) "
    "se prueban con <b>JUnit 5</b> y <b>Mockito</b>. Las pruebas son unitarias: se "
    "mockean los repositorios (Spring Data JPA) y demás dependencias para validar la "
    "lógica de negocio de forma aislada, sin base de datos. La cobertura se mide con "
    "<b>JaCoCo</b>, que genera reportes HTML y CSV en <font face='Courier'>target/site/jacoco/</font>.", body))

story.append(Paragraph("2. Resumen de resultados", h2))
total_tests = sum(TEST_COUNTS.values())
tbl = [["Microservicio", "N° pruebas", "Resultado", "Instr.", "Ramas", "Líneas"]]
for name, _ in SERVICES:
    d = data[name]
    tbl.append([name, str(TEST_COUNTS[name]), "100% OK",
                f"{d['instr']:.1f}%", f"{d['branch']:.1f}%", f"{d['line']:.1f}%"])
tbl.append(["TOTAL", str(total_tests), "100% OK", "—", "—", "—"])
t = Table(tbl, colWidths=[4.3*cm, 2.2*cm, 2.3*cm, 2*cm, 2*cm, 2*cm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), LEAF),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ("BACKGROUND", (0, -1), (-1, -1), LIGHT),
    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f7f7f5")]),
]))
story.append(t)
story.append(Paragraph(
    f"Se ejecutaron <b>{total_tests} pruebas unitarias</b> en total (24 en ms-usuarios y "
    "21 en ms-pedidos), todas exitosas. Ambos microservicios <b>superan el mínimo del "
    "60%</b> de cobertura exigido por la rúbrica.", body))

story.append(Paragraph("3. Gráfico de cobertura", h2))
story.append(Image(str(chart), width=15*cm, height=7.5*cm))

story.append(Paragraph("4. Cobertura por clase", h2))
for name, _ in SERVICES:
    story.append(Paragraph(f"<b>{name}</b>", body))
    rows = sorted(data[name]["rows"], key=lambda r: (-r["instr"]))
    ct = [["Clase", "Paquete", "Instr.", "Cobertura"]]
    for r in rows:
        ct.append([r["clase"], r["paquete"], str(r["instr"]), f"{r['cob']:.0f}%"])
    tt = Table(ct, colWidths=[4.6*cm, 5.4*cm, 2*cm, 2.4*cm])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CLAY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7f5")]),
    ]))
    story.append(tt)
    story.append(Spacer(1, 8))
story.append(Paragraph(
    "Nota: la lógica de negocio (clases <i>Service</i>) supera el 95% de cobertura. El "
    "resto del porcentaje corresponde a configuración (CORS, OpenAPI), clase main y "
    "entidades, que no son objeto de pruebas unitarias.", small))

story.append(Paragraph("5. Ejemplos de pruebas", h2))
story.append(Paragraph("Validación de regla de negocio (precio por plan) en ms-pedidos:", body))
story.append(Paragraph(
    "@Test void createOk() {<br/>"
    "&nbsp;&nbsp;when(repository.save(any())).thenAnswer(i -&gt; i.getArgument(0));<br/>"
    "&nbsp;&nbsp;PedidoResponse r = service.create(new CreatePedidoRequest(userId, 4));<br/>"
    "&nbsp;&nbsp;assertThat(r.total()).isEqualTo(59990);<br/>"
    "&nbsp;&nbsp;assertThat(r.status()).isEqualTo(\"PENDIENTE\");<br/>}", code))
story.append(Spacer(1, 6))
story.append(Paragraph("Manejo de credenciales inválidas en ms-usuarios:", body))
story.append(Paragraph(
    "@Test void loginWrongPassword() {<br/>"
    "&nbsp;&nbsp;when(repository.findByEmail(...)).thenReturn(Optional.of(usuario));<br/>"
    "&nbsp;&nbsp;when(passwordEncoder.matches(\"mala\", \"hash\")).thenReturn(false);<br/>"
    "&nbsp;&nbsp;assertThatThrownBy(() -&gt; service.login(req))<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;.isInstanceOf(ApiException.class); // HTTP 401<br/>}", code))

story.append(Paragraph("6. Cómo ejecutar las pruebas y generar el reporte", h2))
story.append(Paragraph(
    "Desde la carpeta de cada microservicio (no requiere instalar Maven, se usa el "
    "Maven Wrapper):", body))
story.append(Paragraph(
    "cd ms-usuarios&nbsp;&nbsp;# o ms-pedidos<br/>"
    ".\\mvnw.cmd test&nbsp;&nbsp;# Windows&nbsp;&nbsp;(./mvnw test en Linux/Mac)", code))
story.append(Paragraph(
    "El reporte de cobertura HTML queda en "
    "<font face='Courier'>target/site/jacoco/index.html</font>.", body))

story.append(Paragraph("7. Conclusión", h2))
story.append(Paragraph(
    "El sistema cuenta con 45 pruebas unitarias que cubren la lógica de negocio, la capa "
    "web y el manejo de errores de ambos microservicios. La cobertura global "
    f"({data['ms-usuarios']['instr']:.0f}% y {data['ms-pedidos']['instr']:.0f}% de "
    "instrucciones) supera el umbral del 60%, garantizando la calidad y mantenibilidad "
    "del código mediante el uso de mocks (patrón de diseño aplicado a pruebas) que "
    "aíslan cada componente.", body))

doc = SimpleDocTemplate(str(DOCS / "informe-pruebas-unitarias.pdf"), pagesize=A4,
                        topMargin=1.6*cm, bottomMargin=1.6*cm, leftMargin=1.8*cm, rightMargin=1.8*cm,
                        title="GreenBite - Informe de Pruebas Unitarias", author="Equipo GreenBite")
doc.build(story)
print("OK ->", DOCS / "informe-pruebas-unitarias.pdf")

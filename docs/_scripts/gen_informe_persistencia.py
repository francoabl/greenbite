"""Genera docs/informe-persistencia.pdf"""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable, Image)

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
LEAF = colors.HexColor("#1f5c3b")
CLAY = colors.HexColor("#c36b3c")
LIGHT = colors.HexColor("#eef3ee")

styles = getSampleStyleSheet()
h1 = ParagraphStyle("h1", parent=styles["Title"], textColor=LEAF, fontSize=20, spaceAfter=4)
h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=LEAF, fontSize=13, spaceBefore=12)
body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10, leading=14)
small = ParagraphStyle("small", parent=styles["BodyText"], fontSize=8.5, leading=11, textColor=colors.grey)
code = ParagraphStyle("code", parent=styles["Code"], fontSize=8, leading=10, backColor=LIGHT,
                      borderPadding=6, leftIndent=4)


def header_table(rows, widths, head=CLAY):
    t = Table(rows, colWidths=widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), head),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7f5")]),
    ]))
    return t


story = []
story.append(Paragraph("GreenBite — Informe de Persistencia de Datos", h1))
story.append(Paragraph("Desarrollo Fullstack III · Evaluación Parcial N°3", small))
story.append(HRFlowable(width="100%", color=LEAF, thickness=1.2, spaceBefore=6, spaceAfter=10))

story.append(Paragraph("1. Estrategia de persistencia: Database per Service", h2))
story.append(Paragraph(
    "GreenBite aplica el patrón <b>Database per Service</b>: cada microservicio posee su "
    "propia base de datos <b>PostgreSQL</b>, aislada del resto. Ningún servicio accede a la "
    "base de datos de otro; la comunicación es siempre vía API REST a través del BFF. Esto "
    "garantiza autonomía, aislamiento de fallas y evolución independiente del esquema.", body))
story.append(header_table([
    ["Microservicio", "Base de datos", "Motor", "Puerto"],
    ["ms-usuarios", "usuarios_db", "PostgreSQL 16", "5433"],
    ["ms-pedidos", "pedidos_db", "PostgreSQL 16", "5434"],
], [4*cm, 4*cm, 4.5*cm, 3*cm]))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "Ambas instancias se levantan con Docker Compose, cada una con su propio volumen "
    "persistente (<font face='Courier'>usuarios_data</font> y "
    "<font face='Courier'>pedidos_data</font>), de modo que los datos sobreviven al "
    "reinicio de los contenedores.", body))

story.append(Paragraph("2. Tecnología: JPA / Hibernate (Spring Data JPA)", h2))
story.append(Paragraph(
    "La persistencia se implementa con <b>JPA (Jakarta Persistence API)</b>, usando "
    "<b>Hibernate</b> como proveedor a través de <b>Spring Data JPA</b>. JPA es un estándar "
    "de mapeo objeto-relacional (ORM): las clases Java anotadas con <font face='Courier'>"
    "@Entity</font> se mapean a tablas, y sus atributos a columnas. No se escribe SQL "
    "manual: Hibernate genera y ejecuta las sentencias, y los repositorios derivan las "
    "consultas a partir del nombre de sus métodos.", body))

story.append(Paragraph("3. Configuración de la conexión", h2))
story.append(Paragraph(
    "Cada microservicio define su datasource en "
    "<font face='Courier'>src/main/resources/application.properties</font>. Ejemplo de "
    "ms-usuarios:", body))
story.append(Paragraph(
    "server.port=4001<br/>"
    "spring.datasource.url=jdbc:postgresql://localhost:5433/usuarios_db<br/>"
    "spring.datasource.username=postgres<br/>"
    "spring.datasource.password=postgres<br/>"
    "spring.jpa.hibernate.ddl-auto=update<br/>"
    "spring.jpa.open-in-view=false", code))
story.append(Paragraph(
    "El pool de conexiones (<b>HikariCP</b>) lo autoconfigura Spring Boot. La propiedad "
    "<font face='Courier'>ddl-auto=update</font> hace que Hibernate cree o actualice las "
    "tablas automáticamente al arrancar, a partir de las entidades.", body))

story.append(Paragraph("4. Modelo de datos (entidades)", h2))
story.append(Paragraph("Entidad <b>Usuario</b> → tabla <font face='Courier'>usuarios</font>:", body))
story.append(header_table([
    ["Columna", "Tipo", "Restricción"],
    ["id", "UUID", "PK (generado en @PrePersist)"],
    ["nombre", "TEXT", "NOT NULL"],
    ["email", "TEXT", "NOT NULL, UNIQUE"],
    ["password_hash", "TEXT", "NOT NULL (BCrypt)"],
    ["created_at", "TIMESTAMP", "NOT NULL"],
], [4*cm, 4*cm, 7.5*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph("Entidad <b>Pedido</b> → tabla <font face='Courier'>pedidos</font>:", body))
story.append(header_table([
    ["Columna", "Tipo", "Restricción"],
    ["id", "UUID", "PK (generado en @PrePersist)"],
    ["user_id", "UUID", "NOT NULL"],
    ["plan", "INT", "NOT NULL (1, 2 o 4)"],
    ["status", "TEXT", "NOT NULL (ej. PENDIENTE)"],
    ["total", "INT", "NOT NULL (calculado por plan)"],
    ["created_at", "TIMESTAMP", "NOT NULL"],
], [4*cm, 4*cm, 7.5*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph("Ejemplo del mapeo con anotaciones JPA:", body))
story.append(Paragraph(
    "@Entity @Table(name = \"usuarios\")<br/>"
    "public class Usuario {<br/>"
    "&nbsp;&nbsp;@Id @Column(name=\"id\") private UUID id;<br/>"
    "&nbsp;&nbsp;@Column(nullable=false) private String nombre;<br/>"
    "&nbsp;&nbsp;@Column(unique=true, nullable=false) private String email;<br/>"
    "&nbsp;&nbsp;@Column(name=\"password_hash\") private String passwordHash;<br/>"
    "&nbsp;&nbsp;@Column(name=\"created_at\") private Instant createdAt;<br/>"
    "&nbsp;&nbsp;@PrePersist void onCreate() { if (id==null) id=UUID.randomUUID(); ... }<br/>"
    "}", code))

story.append(Paragraph("5. Acceso a datos: Repository Pattern con Spring Data JPA", h2))
story.append(Paragraph(
    "Los repositorios son interfaces que extienden <font face='Courier'>JpaRepository</font>. "
    "Spring genera la implementación en tiempo de ejecución, incluyendo operaciones CRUD "
    "(save, findById, findAll, deleteById) y las <i>query methods</i> derivadas del nombre:", body))
story.append(Paragraph(
    "public interface UsuarioRepository extends JpaRepository&lt;Usuario, UUID&gt; {<br/>"
    "&nbsp;&nbsp;Optional&lt;Usuario&gt; findByEmail(String email);<br/>"
    "&nbsp;&nbsp;boolean existsByEmail(String email);<br/>"
    "&nbsp;&nbsp;List&lt;Usuario&gt; findAllByOrderByCreatedAtDesc();<br/>"
    "}", code))

story.append(Paragraph("6. Garantías de integridad y persistencia", h2))
story.append(Paragraph(
    "• <b>Transaccionalidad:</b> las operaciones de escritura de Spring Data JPA "
    "(<font face='Courier'>save</font>, <font face='Courier'>deleteById</font>) se ejecutan "
    "dentro de una transacción gestionada por Spring, asegurando atomicidad.<br/>"
    "• <b>Integridad:</b> restricciones a nivel de columna (NOT NULL, UNIQUE en email) "
    "impiden datos inconsistentes; el email duplicado se rechaza con HTTP 409.<br/>"
    "• <b>Identificadores:</b> cada registro usa un UUID generado por la aplicación antes "
    "de persistir (@PrePersist), evitando colisiones entre servicios.<br/>"
    "• <b>Aislamiento por servicio:</b> al tener bases separadas, un fallo en pedidos_db no "
    "afecta a usuarios_db.", body))

story.append(Paragraph("7. Evidencia de persistencia", h2))
story.append(Paragraph(
    "Tras ejecutar el flujo completo (registro de usuarios y creación de pedidos a través "
    "del BFF), se verificó que Hibernate creó las tablas y que los datos quedaron "
    "almacenados de forma persistente en PostgreSQL:", body))
story.append(Paragraph(
    "$ docker compose exec usuarios_db psql -U postgres -d usuarios_db -c \"\\dt\"<br/>"
    "&nbsp;public | usuarios | table | postgres<br/><br/>"
    "$ docker compose exec pedidos_db psql -U postgres -d pedidos_db -c \"\\dt\"<br/>"
    "&nbsp;public | pedidos | table | postgres", code))

story.append(Paragraph("8. Conclusión", h2))
story.append(Paragraph(
    "La persistencia de GreenBite combina el patrón arquitectónico <b>Database per "
    "Service</b> con el patrón de diseño <b>Repository</b> implementado sobre "
    "<b>JPA/Hibernate</b>. Esto desacopla la lógica de negocio del acceso a datos, "
    "centraliza el mapeo objeto-relacional en las entidades y garantiza integridad, "
    "transaccionalidad y autonomía de cada microservicio.", body))

doc = SimpleDocTemplate(str(DOCS / "informe-persistencia.pdf"), pagesize=A4,
                        topMargin=1.6*cm, bottomMargin=1.6*cm, leftMargin=1.8*cm, rightMargin=1.8*cm,
                        title="GreenBite - Informe de Persistencia", author="Equipo GreenBite")
doc.build(story)
print("OK ->", DOCS / "informe-persistencia.pdf")

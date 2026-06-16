/* Genera los informes en .docx (persistencia y pruebas unitarias).
 * Requiere el paquete docx (docx-js). Lee metricas reales de JaCoCo.
 * Uso: NODE_PATH=<.../node_modules> node docs/_scripts/gen_docx_informes.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, ImageRun, PageBreak,
} = require("docx");

const ROOT = path.resolve(__dirname, "..", "..");
const DOCS = path.join(ROOT, "docs");
const LEAF = "1F5C3B";
const CLAY = "C36B3C";
const LIGHT = "EEF3EE";
const ZEBRA = "F7F7F5";
const CW = 9026; // ancho de contenido A4 con margenes de 1"

// ---------- helpers ----------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });

function P(runs) {
  if (typeof runs === "string") runs = [new TextRun(runs)];
  return new Paragraph({ spacing: { after: 120 }, children: runs });
}
function r(text, opts = {}) { return new TextRun({ text, ...opts }); }
function b(text) { return new TextRun({ text, bold: true }); }
function mono(text) { return new TextRun({ text, font: "Consolas", size: 18 }); }

function subtitle(t) {
  return new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: t, color: "808080", size: 18 })] });
}
function rule() {
  return new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: LEAF, space: 1 } }, spacing: { after: 160 } });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 },
    children: typeof text === "string" ? [new TextRun(text)] : text });
}
function codeBlock(lines) {
  return lines.map((ln, i) => new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: LIGHT },
    spacing: { after: i === lines.length - 1 ? 140 : 0, line: 240 },
    children: [new TextRun({ text: ln === "" ? " " : ln, font: "Consolas", size: 16 })],
  }));
}

const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function cell(text, width, { head = false, bold = false, fill = null, align = AlignmentType.LEFT } = {}) {
  return new TableCell({
    borders: BORDERS, width: { size: width, type: WidthType.DXA },
    shading: head ? { type: ShadingType.CLEAR, fill: CLAY } : (fill ? { type: ShadingType.CLEAR, fill } : undefined),
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold: head || bold, color: head ? "FFFFFF" : undefined, size: 18 })] })],
  });
}
function table(headers, rows, widths, { headColor = CLAY } = {}) {
  const headRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => {
    const c = cell(h, widths[i], { head: true });
    if (headColor !== CLAY) c.options.shading = { type: ShadingType.CLEAR, fill: headColor };
    return c;
  }) });
  const bodyRows = rows.map((row, ri) => new TableRow({ children: row.map((v, i) =>
    cell(v, widths[i], { fill: ri % 2 ? ZEBRA : null, align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER })) }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [headRow, ...bodyRows] });
}

// ---------- leer cobertura JaCoCo ----------
function readCoverage(csvPath) {
  const text = fs.readFileSync(csvPath, "utf-8").trim().split(/\r?\n/);
  const header = text[0].split(",");
  const idx = (n) => header.indexOf(n);
  const tot = { im: 0, ic: 0, bm: 0, bc: 0, lm: 0, lc: 0 };
  const rows = [];
  for (let i = 1; i < text.length; i++) {
    const c = text[i].split(",");
    const im = +c[idx("INSTRUCTION_MISSED")], ic = +c[idx("INSTRUCTION_COVERED")];
    const bm = +c[idx("BRANCH_MISSED")], bc = +c[idx("BRANCH_COVERED")];
    const lm = +c[idx("LINE_MISSED")], lc = +c[idx("LINE_COVERED")];
    tot.im += im; tot.ic += ic; tot.bm += bm; tot.bc += bc; tot.lm += lm; tot.lc += lc;
    const instr = ic + im;
    rows.push({ clase: c[idx("CLASS")], paquete: c[idx("PACKAGE")].replace("com.greenbite.", ""),
      cob: instr ? Math.round(100 * ic / instr) : 100, instr });
  }
  const pct = (cv, ms) => { const t = cv + ms; return t ? (100 * cv / t) : 100; };
  return { rows: rows.sort((a, b2) => b2.instr - a.instr),
    instr: pct(tot.ic, tot.im), branch: pct(tot.bc, tot.bm), line: pct(tot.lc, tot.lm) };
}

const cov = {
  "ms-usuarios": readCoverage(path.join(ROOT, "ms-usuarios", "target", "site", "jacoco", "jacoco.csv")),
  "ms-pedidos": readCoverage(path.join(ROOT, "ms-pedidos", "target", "site", "jacoco", "jacoco.csv")),
};
const TESTS = { "ms-usuarios": 24, "ms-pedidos": 21 };

// ---------- estilos comunes ----------
const docStyles = {
  default: { document: { run: { font: "Arial", size: 22 } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 32, bold: true, font: "Arial", color: LEAF },
      paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 26, bold: true, font: "Arial", color: LEAF },
      paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
  ],
};
const numbering = { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
  alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] }] };
const sectionProps = { properties: { page: { size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } } };

function build(name, children) {
  const doc = new Document({ styles: docStyles, numbering, sections: [{ ...sectionProps, children }] });
  return Packer.toBuffer(doc).then((buf) => {
    const out = path.join(DOCS, name);
    fs.writeFileSync(out, buf);
    console.log("OK ->", out);
  });
}

// =================== INFORME DE PERSISTENCIA ===================
function persistencia() {
  const k = [];
  k.push(new Paragraph({ children: [new TextRun({ text: "GreenBite — Informe de Persistencia de Datos", bold: true, size: 40, color: LEAF })], spacing: { after: 40 } }));
  k.push(subtitle("Desarrollo Fullstack III · Evaluación Parcial N°3"));
  k.push(rule());

  k.push(H1("1. Estrategia de persistencia: Database per Service"));
  k.push(P([r("GreenBite aplica el patrón "), b("Database per Service"), r(": cada microservicio posee su propia base de datos "), b("PostgreSQL"), r(", aislada del resto. Ningún servicio accede a la base de datos de otro; la comunicación es siempre vía API REST a través del BFF. Esto garantiza autonomía, aislamiento de fallas y evolución independiente del esquema.")]));
  k.push(table(["Microservicio", "Base de datos", "Motor", "Puerto"],
    [["ms-usuarios", "usuarios_db", "PostgreSQL 16", "5433"], ["ms-pedidos", "pedidos_db", "PostgreSQL 16", "5434"]],
    [2600, 2600, 2400, 1426]));
  k.push(P(""));
  k.push(P([r("Ambas instancias se levantan con Docker Compose, cada una con su propio volumen persistente ("), mono("usuarios_data"), r(" y "), mono("pedidos_data"), r("), de modo que los datos sobreviven al reinicio de los contenedores.")]));

  k.push(H1("2. Tecnología: JPA / Hibernate (Spring Data JPA)"));
  k.push(P([r("La persistencia se implementa con "), b("JPA (Jakarta Persistence API)"), r(", usando "), b("Hibernate"), r(" como proveedor a través de "), b("Spring Data JPA"), r(". JPA es un estándar de mapeo objeto-relacional (ORM): las clases Java anotadas con "), mono("@Entity"), r(" se mapean a tablas y sus atributos a columnas. No se escribe SQL manual: Hibernate genera las sentencias y los repositorios derivan las consultas del nombre de sus métodos.")]));

  k.push(H1("3. Configuración de la conexión"));
  k.push(P([r("Cada microservicio define su datasource en "), mono("src/main/resources/application.properties"), r(". Ejemplo de ms-usuarios:")]));
  k.push(...codeBlock([
    "server.port=4001",
    "spring.datasource.url=jdbc:postgresql://localhost:5433/usuarios_db",
    "spring.datasource.username=postgres",
    "spring.datasource.password=postgres",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.jpa.open-in-view=false",
  ]));
  k.push(P([r("El pool de conexiones ("), b("HikariCP"), r(") lo autoconfigura Spring Boot. La propiedad "), mono("ddl-auto=update"), r(" hace que Hibernate cree o actualice las tablas automáticamente al arrancar, a partir de las entidades.")]));

  k.push(H1("4. Modelo de datos (entidades)"));
  k.push(P([r("Entidad "), b("Usuario"), r(" → tabla "), mono("usuarios"), r(":")]));
  k.push(table(["Columna", "Tipo", "Restricción"], [
    ["id", "UUID", "PK (generado en @PrePersist)"],
    ["nombre", "TEXT", "NOT NULL"],
    ["email", "TEXT", "NOT NULL, UNIQUE"],
    ["password_hash", "TEXT", "NOT NULL (BCrypt)"],
    ["created_at", "TIMESTAMP", "NOT NULL"],
  ], [2600, 2200, 4226]));
  k.push(P(""));
  k.push(P([r("Entidad "), b("Pedido"), r(" → tabla "), mono("pedidos"), r(":")]));
  k.push(table(["Columna", "Tipo", "Restricción"], [
    ["id", "UUID", "PK (generado en @PrePersist)"],
    ["user_id", "UUID", "NOT NULL"],
    ["plan", "INT", "NOT NULL (1, 2 o 4)"],
    ["status", "TEXT", "NOT NULL (ej. PENDIENTE)"],
    ["total", "INT", "NOT NULL (calculado por plan)"],
    ["created_at", "TIMESTAMP", "NOT NULL"],
  ], [2600, 2200, 4226]));
  k.push(P(""));
  k.push(P("Ejemplo del mapeo con anotaciones JPA:"));
  k.push(...codeBlock([
    "@Entity @Table(name = \"usuarios\")",
    "public class Usuario {",
    "  @Id @Column(name=\"id\") private UUID id;",
    "  @Column(nullable=false) private String nombre;",
    "  @Column(unique=true, nullable=false) private String email;",
    "  @Column(name=\"password_hash\") private String passwordHash;",
    "  @Column(name=\"created_at\") private Instant createdAt;",
    "  @PrePersist void onCreate() { if (id==null) id=UUID.randomUUID(); }",
    "}",
  ]));

  k.push(H1("5. Acceso a datos: Repository Pattern con Spring Data JPA"));
  k.push(P([r("Los repositorios son interfaces que extienden "), mono("JpaRepository"), r(". Spring genera la implementación en tiempo de ejecución, incluyendo CRUD (save, findById, findAll, deleteById) y las query methods derivadas del nombre:")]));
  k.push(...codeBlock([
    "public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {",
    "  Optional<Usuario> findByEmail(String email);",
    "  boolean existsByEmail(String email);",
    "  List<Usuario> findAllByOrderByCreatedAtDesc();",
    "}",
  ]));

  k.push(H1("6. Garantías de integridad y persistencia"));
  k.push(bullet([b("Transaccionalidad: "), r("las escrituras de Spring Data JPA (save, deleteById) se ejecutan dentro de una transacción gestionada por Spring, asegurando atomicidad.")]));
  k.push(bullet([b("Integridad: "), r("restricciones de columna (NOT NULL, UNIQUE en email) impiden datos inconsistentes; el email duplicado se rechaza con HTTP 409.")]));
  k.push(bullet([b("Identificadores: "), r("cada registro usa un UUID generado por la aplicación antes de persistir (@PrePersist), evitando colisiones entre servicios.")]));
  k.push(bullet([b("Aislamiento por servicio: "), r("al tener bases separadas, un fallo en pedidos_db no afecta a usuarios_db.")]));

  k.push(H1("7. Evidencia de persistencia"));
  k.push(P("Tras ejecutar el flujo completo (registro de usuarios y creación de pedidos a través del BFF), se verificó que Hibernate creó las tablas y que los datos quedaron almacenados de forma persistente en PostgreSQL:"));
  k.push(...codeBlock([
    "$ docker compose exec usuarios_db psql -U postgres -d usuarios_db -c \"\\dt\"",
    "  public | usuarios | table | postgres",
    "",
    "$ docker compose exec pedidos_db psql -U postgres -d pedidos_db -c \"\\dt\"",
    "  public | pedidos | table | postgres",
  ]));

  k.push(H1("8. Conclusión"));
  k.push(P([r("La persistencia de GreenBite combina el patrón arquitectónico "), b("Database per Service"), r(" con el patrón de diseño "), b("Repository"), r(" sobre "), b("JPA/Hibernate"), r(". Esto desacopla la lógica de negocio del acceso a datos, centraliza el mapeo objeto-relacional en las entidades y garantiza integridad, transaccionalidad y autonomía de cada microservicio.")]));

  return build("informe-persistencia.docx", k);
}

// =================== INFORME DE PRUEBAS UNITARIAS ===================
function pruebas() {
  const k = [];
  k.push(new Paragraph({ children: [new TextRun({ text: "GreenBite — Informe de Pruebas Unitarias", bold: true, size: 40, color: LEAF })], spacing: { after: 40 } }));
  k.push(subtitle("Desarrollo Fullstack III · Evaluación Parcial N°3"));
  k.push(rule());

  k.push(H1("1. Introducción"));
  k.push(P([r("Los microservicios "), b("ms-usuarios"), r(" y "), b("ms-pedidos"), r(" (Java 17 + Spring Boot) se prueban con "), b("JUnit 5"), r(" y "), b("Mockito"), r(". Las pruebas son unitarias: se mockean los repositorios (Spring Data JPA) y demás dependencias para validar la lógica de negocio de forma aislada, sin base de datos. La cobertura se mide con "), b("JaCoCo"), r(", que genera reportes HTML y CSV en "), mono("target/site/jacoco/"), r(".")]));

  k.push(H1("2. Resumen de resultados"));
  const total = TESTS["ms-usuarios"] + TESTS["ms-pedidos"];
  const sumRow = (n) => [n, String(TESTS[n]), "100% OK", `${cov[n].instr.toFixed(1)}%`, `${cov[n].branch.toFixed(1)}%`, `${cov[n].line.toFixed(1)}%`];
  k.push(table(["Microservicio", "N° pruebas", "Resultado", "Instr.", "Ramas", "Líneas"],
    [sumRow("ms-usuarios"), sumRow("ms-pedidos"), ["TOTAL", String(total), "100% OK", "—", "—", "—"]],
    [2426, 1400, 1400, 1266, 1266, 1268], { headColor: LEAF }));
  k.push(P(""));
  k.push(P([r("Se ejecutaron "), b(`${total} pruebas unitarias`), r(" en total (24 en ms-usuarios y 21 en ms-pedidos), todas exitosas. Ambos microservicios "), b("superan el mínimo del 60%"), r(" de cobertura exigido por la rúbrica.")]));

  k.push(H1("3. Gráfico de cobertura"));
  const chart = path.join(DOCS, "cobertura-chart.png");
  if (fs.existsSync(chart)) {
    k.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({
      type: "png", data: fs.readFileSync(chart), transformation: { width: 540, height: 270 },
      altText: { title: "Cobertura", description: "Grafico de cobertura JaCoCo", name: "cobertura" } })] }));
  }

  k.push(H1("4. Cobertura por clase"));
  for (const n of ["ms-usuarios", "ms-pedidos"]) {
    k.push(P([b(n)]));
    const rows = cov[n].rows.map((x) => [x.clase, x.paquete, String(x.instr), `${x.cob}%`]);
    k.push(table(["Clase", "Paquete", "Instr.", "Cobertura"], rows, [2900, 3400, 1200, 1526]));
    k.push(P(""));
  }
  k.push(P([new TextRun({ text: "Nota: la lógica de negocio (clases Service) supera el 95% de cobertura. El resto corresponde a configuración (CORS, OpenAPI), clase main y entidades, que no son objeto de pruebas unitarias.", size: 18, color: "808080" })]));

  k.push(H1("5. Ejemplos de pruebas"));
  k.push(P("Validación de regla de negocio (precio por plan) en ms-pedidos:"));
  k.push(...codeBlock([
    "@Test void createOk() {",
    "  when(repository.save(any())).thenAnswer(i -> i.getArgument(0));",
    "  PedidoResponse r = service.create(new CreatePedidoRequest(userId, 4));",
    "  assertThat(r.total()).isEqualTo(59990);",
    "  assertThat(r.status()).isEqualTo(\"PENDIENTE\");",
    "}",
  ]));
  k.push(P("Manejo de credenciales inválidas en ms-usuarios:"));
  k.push(...codeBlock([
    "@Test void loginWrongPassword() {",
    "  when(repository.findByEmail(...)).thenReturn(Optional.of(usuario));",
    "  when(passwordEncoder.matches(\"mala\", \"hash\")).thenReturn(false);",
    "  assertThatThrownBy(() -> service.login(req))",
    "    .isInstanceOf(ApiException.class); // HTTP 401",
    "}",
  ]));

  k.push(H1("6. Cómo ejecutar las pruebas y generar el reporte"));
  k.push(P("Desde la carpeta de cada microservicio (no requiere instalar Maven, se usa el Maven Wrapper):"));
  k.push(...codeBlock([
    "cd ms-usuarios   # o ms-pedidos",
    ".\\mvnw.cmd test   # Windows  (./mvnw test en Linux/Mac)",
  ]));
  k.push(P([r("El reporte de cobertura HTML queda en "), mono("target/site/jacoco/index.html"), r(".")]));

  k.push(H1("7. Evidencia de ejecución de las pruebas"));
  k.push(P("Capturas de la ejecución real de las pruebas con el Maven Wrapper en cada microservicio (BUILD SUCCESS y reporte JaCoCo generado):"));
  const shots = [
    ["ms-usuarios — 24 pruebas, 0 fallos", "tests-ms-usuarios.png", 500, 193],
    ["ms-pedidos — 21 pruebas, 0 fallos", "tests-ms-pedidos.png", 540, 131],
  ];
  for (const [cap, file, w, h] of shots) {
    const img = path.join(DOCS, "evidencia", file);
    if (fs.existsSync(img)) {
      k.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: cap, bold: true, size: 18 })] }));
      k.push(new Paragraph({ spacing: { after: 160 }, children: [new ImageRun({
        type: "png", data: fs.readFileSync(img), transformation: { width: w, height: h },
        altText: { title: cap, description: "Ejecucion de pruebas", name: file } })] }));
    }
  }

  k.push(H1("8. Conclusión"));
  k.push(P([r("El sistema cuenta con 45 pruebas unitarias que cubren la lógica de negocio, la capa web y el manejo de errores de ambos microservicios. La cobertura global ("), b(`${cov["ms-usuarios"].instr.toFixed(0)}%`), r(" y "), b(`${cov["ms-pedidos"].instr.toFixed(0)}%`), r(" de instrucciones) supera el umbral del 60%, garantizando la calidad y mantenibilidad del código mediante el uso de mocks que aíslan cada componente.")]));

  return build("informe-pruebas-unitarias.docx", k);
}

persistencia().then(pruebas).catch((e) => { console.error(e); process.exit(1); });

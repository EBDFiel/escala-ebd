const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function findAll(regex, text, group = 1) {
  const result = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    result.push(match[group]);
  }
  return uniq(result);
}

function tryGit(command, fallback = "") {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch (error) {
    return fallback;
  }
}

function extractMetaVersion(text, metaName) {
  const match = text.match(new RegExp(`<meta\\s+name=["']${metaName}["']\\s+content=["']([^"']+)["']`, "i"));
  return match ? match[1] : "";
}

function extractConst(text, name) {
  const match = text.match(new RegExp(`const\\s+${name}\\s*=\\s*["']([^"']+)["']`));
  return match ? match[1] : "";
}

function extractIds(text) {
  return findAll(/id=["']([^"']+)["']/g, text);
}

function extractFunctions(text) {
  return findAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g, text);
}

function extractAsyncFunctions(text) {
  return findAll(/async\s+function\s+([A-Za-z0-9_$]+)\s*\(/g, text);
}

function extractActionsFromAppsScript(text) {
  const actions = [
    ...findAll(/acao\s*===\s*["']([^"']+)["']/g, text),
    ...findAll(/case\s+["']([^"']+)["']\s*:/g, text)
  ];

  return uniq(actions);
}

function extractPanels(adminHtml) {
  return extractIds(adminHtml)
    .filter((id) => id.startsWith("painel"))
    .filter((id) => id !== "painelAdmin");
}

function extractButtons(htmlText) {
  const labels = [];
  const buttonRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  let match;

  while ((match = buttonRegex.exec(htmlText)) !== null) {
    const clean = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) labels.push(clean);
  }

  return uniq(labels);
}

function fileSummary(file) {
  if (!exists(file)) {
    return {
      exists: false,
      size: 0,
      lines: 0
    };
  }

  const content = read(file);

  return {
    exists: true,
    size: Buffer.byteLength(content, "utf8"),
    lines: content.split(/\r?\n/).length
  };
}

const indexHtml = read("index.html");
const adminHtml = read("admin.html");
const codeGs = read("Code.gs");

const generatedAt = new Date().toLocaleString("pt-BR", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

const commit = tryGit("git rev-parse --short HEAD", "não disponível");
const lastCommitMessage = tryGit("git log -1 --pretty=%B", "não disponível");
const branch = tryGit("git branch --show-current", "não disponível");

const appScriptUrl =
  extractConst(indexHtml, "APPS_SCRIPT_URL") ||
  extractConst(adminHtml, "APPS_SCRIPT_URL") ||
  "não encontrado";

const senhaAlterarDia = extractConst(indexHtml, "SENHA_ALTERAR_DIA") || "não encontrada no index.html";

const indexVersion =
  extractMetaVersion(indexHtml, "ebd-index-versao") ||
  "sem marcador encontrado";

const adminVersion =
  extractMetaVersion(adminHtml, "ebd-admin-versao") ||
  "sem marcador encontrado";

const files = ["index.html", "admin.html", "Code.gs", "mapa-site.html"];

const indexIds = extractIds(indexHtml);
const adminIds = extractIds(adminHtml);
const indexFunctions = uniq([...extractFunctions(indexHtml), ...extractAsyncFunctions(indexHtml)]).sort();
const adminFunctions = uniq([...extractFunctions(adminHtml), ...extractAsyncFunctions(adminHtml)]).sort();
const appsScriptFunctions = uniq([...extractFunctions(codeGs), ...extractAsyncFunctions(codeGs)]).sort();
const appsScriptActions = extractActionsFromAppsScript(codeGs).sort();
const panels = extractPanels(adminHtml).sort();
const buttonsIndex = extractButtons(indexHtml);
const buttonsAdmin = extractButtons(adminHtml);

const hasQuiz = indexHtml.includes("quizAdultos") || adminHtml.includes("quizAdultosLink");
const hasWhatsapp = indexHtml.includes("compartilharQuizWhatsApp") || indexHtml.includes("api.whatsapp.com");
const hasMapa = adminHtml.includes("mapa-site.html") || adminHtml.includes("painelMapa");
const hasSenhaAlteracao = indexHtml.includes("SENHA_ALTERAR_DIA");
const hasBotaoSemana = indexHtml.includes("btnVoltarSemanaAtual") || indexHtml.includes("voltarParaSemanaAtual");

function list(items, empty = "Nenhum item encontrado.") {
  if (!items || !items.length) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function tableRows(items) {
  return items.map((file) => {
    const summary = fileSummary(file);
    return `
      <tr>
        <td>${escapeHtml(file)}</td>
        <td>${summary.exists ? "Sim" : "Não"}</td>
        <td>${summary.exists ? summary.lines : "-"}</td>
        <td>${summary.exists ? summary.size : "-"}</td>
      </tr>`;
  }).join("");
}

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mapa automático do Site Escala EBD</title>
  <style>
    :root {
      --navy: #0b2740;
      --blue: #1f4e79;
      --gold: #d4af37;
      --bg: #f4f8fb;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #64748b;
      --line: #dbe4ee;
      --green: #166534;
      --purple: #6d28d9;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(212,175,55,0.16), transparent 28%),
        linear-gradient(135deg, #f4f8fb, #ffffff);
      line-height: 1.6;
    }

    .page {
      max-width: 1120px;
      margin: 0 auto;
      padding: 22px;
    }

    .hero {
      padding: 28px;
      border-radius: 28px;
      color: #ffffff;
      background: linear-gradient(135deg, var(--navy), var(--blue));
      border-bottom: 6px solid var(--gold);
      box-shadow: 0 20px 44px rgba(11,39,64,0.22);
    }

    .hero h1 {
      margin: 0 0 8px;
      font-size: clamp(1.7rem, 4vw, 2.55rem);
      line-height: 1.12;
    }

    .hero p {
      margin: 6px 0 0;
      color: rgba(255,255,255,0.88);
      max-width: 850px;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.22);
      color: #fff8d8;
      font-weight: 800;
      font-size: 0.86rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
      gap: 16px;
      margin-top: 18px;
    }

    .card,
    .section {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 20px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
    }

    .card h2,
    .section h2 {
      margin: 0 0 10px;
      color: var(--navy);
      font-size: 1.18rem;
    }

    .section {
      margin-top: 18px;
    }

    h3 {
      color: var(--blue);
      margin: 18px 0 8px;
    }

    .muted {
      color: var(--muted);
    }

    code,
    pre {
      font-family: Consolas, Monaco, monospace;
    }

    pre {
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      background: #0f172a;
      color: #dbeafe;
      padding: 14px;
      border-radius: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 16px;
      border: 1px solid var(--line);
    }

    th,
    td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #eaf3fb;
      color: var(--navy);
    }

    ul {
      margin-top: 0;
      padding-left: 1.2rem;
    }

    .status-ok {
      color: var(--green);
      font-weight: 900;
    }

    .status-info {
      color: var(--purple);
      font-weight: 900;
    }

    .footer {
      text-align: center;
      color: var(--muted);
      padding: 28px 10px 8px;
      font-size: 0.92rem;
    }

    @media print {
      body {
        background: #ffffff;
      }

      .page {
        max-width: none;
        padding: 0;
      }

      .hero,
      .card,
      .section {
        box-shadow: none;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <h1>🗺️ Mapa automático do Site Escala EBD</h1>
      <p>
        Documento gerado automaticamente pelo GitHub Actions a partir dos arquivos
        <strong>index.html</strong>, <strong>admin.html</strong> e <strong>Code.gs</strong>.
      </p>

      <div class="badge-row">
        <span class="badge">📅 Gerado em: ${escapeHtml(generatedAt)}</span>
        <span class="badge">🌿 Branch: ${escapeHtml(branch)}</span>
        <span class="badge">🔖 Commit: ${escapeHtml(commit)}</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>🌐 Página pública</h2>
        <p><strong>Arquivo:</strong> index.html</p>
        <p><strong>Versão:</strong><br>${escapeHtml(indexVersion)}</p>
      </div>

      <div class="card">
        <h2>🔐 Painel admin</h2>
        <p><strong>Arquivo:</strong> admin.html</p>
        <p><strong>Versão:</strong><br>${escapeHtml(adminVersion)}</p>
      </div>

      <div class="card">
        <h2>⚙️ Apps Script</h2>
        <p><strong>Arquivo:</strong> Code.gs</p>
        <p><strong>Ações detectadas:</strong> ${appsScriptActions.length}</p>
      </div>

      <div class="card">
        <h2>🔗 Apps Script URL</h2>
        <p class="muted">${escapeHtml(appScriptUrl)}</p>
      </div>
    </div>

    <section class="section">
      <h2>1. Último commit analisado</h2>
      <pre>${escapeHtml(lastCommitMessage)}</pre>
    </section>

    <section class="section">
      <h2>2. Arquivos principais</h2>
      <table>
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Existe?</th>
            <th>Linhas</th>
            <th>Tamanho bytes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows(files)}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>3. Recursos detectados automaticamente</h2>
      <ul>
        <li class="${hasQuiz ? "status-ok" : ""}">🧠 Quizzes externos: ${hasQuiz ? "detectado" : "não detectado"}</li>
        <li class="${hasWhatsapp ? "status-ok" : ""}">📲 Compartilhamento por WhatsApp: ${hasWhatsapp ? "detectado" : "não detectado"}</li>
        <li class="${hasMapa ? "status-ok" : ""}">🗺️ Mapa do site no admin: ${hasMapa ? "detectado" : "não detectado"}</li>
        <li class="${hasSenhaAlteracao ? "status-ok" : ""}">🔐 Senha para alterar dia: ${hasSenhaAlteracao ? "detectada" : "não detectada"}</li>
        <li class="${hasBotaoSemana ? "status-ok" : ""}">📌 Botão voltar para semana atual: ${hasBotaoSemana ? "detectado" : "não detectado"}</li>
      </ul>
    </section>

    <section class="section">
      <h2>4. Senhas e constantes importantes</h2>
      <p><strong>Senha para alterar dia na página pública:</strong> ${escapeHtml(senhaAlterarDia)}</p>
      <p class="muted">
        A senha do painel admin fica no Code.gs em <code>SENHA_ADMIN</code>.
        Por segurança, este mapa não tenta exibir essa senha.
      </p>
    </section>

    <section class="section">
      <h2>5. Abas/painéis detectados no admin.html</h2>
      ${list(panels, "Nenhum painel detectado.")}
    </section>

    <section class="section">
      <h2>6. Ações detectadas no Apps Script</h2>
      ${list(appsScriptActions, "Nenhuma ação detectada.")}
    </section>

    <section class="section">
      <h2>7. Funções principais do index.html</h2>
      ${list(indexFunctions, "Nenhuma função detectada.")}
    </section>

    <section class="section">
      <h2>8. Funções principais do admin.html</h2>
      ${list(adminFunctions, "Nenhuma função detectada.")}
    </section>

    <section class="section">
      <h2>9. Funções principais do Code.gs</h2>
      ${list(appsScriptFunctions, "Nenhuma função detectada.")}
    </section>

    <section class="section">
      <h2>10. IDs importantes do index.html</h2>
      ${list(indexIds, "Nenhum ID detectado.")}
    </section>

    <section class="section">
      <h2>11. IDs importantes do admin.html</h2>
      ${list(adminIds, "Nenhum ID detectado.")}
    </section>

    <section class="section">
      <h2>12. Botões detectados na página pública</h2>
      ${list(buttonsIndex, "Nenhum botão detectado.")}
    </section>

    <section class="section">
      <h2>13. Botões detectados no painel admin</h2>
      ${list(buttonsAdmin, "Nenhum botão detectado.")}
    </section>

    <section class="section">
      <h2>14. Como publicar alterações</h2>
      <h3>Quando alterar index.html ou admin.html</h3>
      <ol>
        <li>Substituir o arquivo no GitHub.</li>
        <li>Fazer commit.</li>
        <li>Aguardar o GitHub Pages atualizar.</li>
        <li>Abrir o site e usar Ctrl + F5.</li>
      </ol>

      <h3>Quando alterar Code.gs</h3>
      <ol>
        <li>Colar o código no Apps Script.</li>
        <li>Conferir SENHA_ADMIN.</li>
        <li>Salvar.</li>
        <li>Implantar como Nova versão.</li>
      </ol>
    </section>

    <section class="section">
      <h2>15. Observação importante</h2>
      <p>
        Este mapa é automático e técnico. Ele detecta estrutura, funções, IDs, botões,
        ações e marcadores de versão. Para explicações pastorais, decisões de design
        ou intenção das mudanças, mantenha também uma documentação manual no painel.
      </p>
    </section>

    <div class="footer">
      ⛪ Escala EBD · Mapa automático gerado pelo GitHub Actions
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "mapa-site.html"), html, "utf8");

console.log("Mapa do site gerado com sucesso em mapa-site.html");

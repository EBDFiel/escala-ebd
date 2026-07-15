const NOME_ABA_ESCALA = "Escala EBD";
const NOME_ABA_HISTORICO = "Histórico";
const NOME_ABA_HISTORICO_ESCALAS = "Historico_Escalas";
const NOME_ABA_LICOES = "Licoes";
const NOME_ABA_PROFESSORES = "Professores";
const NOME_ABA_QUIZZES = "Quizzes";
const TIMEZONE_EBD = "America/Sao_Paulo";
const VERSAO_BACKEND_EBD = "EBD_3_2_CONFIRMACAO_LICOES_2026_07_15";

// Configure em Configurações do projeto > Propriedades do script:
// EBD_SENHA_ADMIN e EBD_SENHA_TROCA.
const PROP_SENHA_ADMIN_EBD = "EBD_SENHA_ADMIN";
const PROP_SENHA_TROCA_EBD = "EBD_SENHA_TROCA";
const TTL_TOKEN_ADMIN_EBD = 1800;
const TTL_TOKEN_TROCA_EBD = 900;
const LIMITE_FALHAS_LOGIN_EBD = 8;
const TTL_FALHAS_LOGIN_EBD = 600;
const ID_PLANILHA_PADRAO_EBD = "1qei2p9Z61M5yOVxRPPDReguHQ7I9far3Hnr_LL-hZHc";
const PROP_PLANILHA_ID_EBD = "EBD_PLANILHA_ID";
const PROP_ESTADO_TRIMESTRAL_EBD = "EBD_ESTADO_TRIMESTRAL";
const FUNCAO_GATILHO_TRIMESTRAL_EBD = "verificarEncerramentoTrimestralEBD";
const HORA_GATILHO_TRIMESTRAL_EBD = 4;

// Armazenamento das lições atuais no Google Drive.
const PROP_PASTA_LICOES_DRIVE_EBD = "EBD_LICOES_DRIVE_FOLDER_ID";
const NOME_PASTA_LICOES_DRIVE_EBD = "Escala EBD - Licoes Atuais";
const LIMITE_ARQUIVO_LICAO_BYTES_EBD = 9 * 1024 * 1024;
const CONFIG_ARQUIVOS_LICOES_EBD = {
  adultos: {
    nome: "licao-adultos.html",
    propriedade: "EBD_LICAO_ADULTOS_FILE_ID"
  },
  jovens: {
    nome: "licao-jovens.html",
    propriedade: "EBD_LICAO_JOVENS_FILE_ID"
  }
};

const CLASSES_ESCALA_EBD = [
  "Cordeirinhos de Cristo",
  "Soldadinhos de Cristo",
  "Heróis e Amigos",
  "Mensageiros de Cristo",
  "Vencedores por Cristo",
  "Vivendo em Cristo",
  "Testemunhas de Cristo",
  "Sara",
  "Heróis da Fé"
];

const COLUNA_SUPORTE_EBD = "Suporte";
const PROFESSOR_APOIO_RONAN_EBD = "Ronan";
const VALOR_APOIO_RONAN_EBD = "__RONAN_APOIO__";
const CLASSES_APOIO_RONAN_EBD = ["Testemunhas de Cristo", "Heróis da Fé"];

const MAPA_CLASSES_ANTIGAS_EBD = {
  "Crianças 1 a 5 anos": "Cordeirinhos de Cristo",
  "Crianças 6 a 10 anos": "Soldadinhos de Cristo",
  "Pré-Adolescentes": "Heróis e Amigos",
  "Adolescentes": "Vencedores por Cristo",
  "Discipulado": "Vivendo em Cristo",
  "Jovens": "Testemunhas de Cristo",
  "Irmãs": "Sara",
  "Irmãos": "Heróis da Fé"
};

const ORDEM_COLUNAS_ESCALA_EBD = ["Data"].concat(CLASSES_ESCALA_EBD).concat([COLUNA_SUPORTE_EBD]);
const ACOES_ESCRITA_EBD = {
  trocar:true, salvarLicoes:true, migrarLicoesDrive:true, adminSalvarProfessor:true, adminAdicionarData:true,
  adminRemoverData:true, adminRenomearClasse:true, salvarQuizzes:true,
  adicionarProfessor:true, atualizarProfessor:true, inativarProfessor:true,
  substituirProfessor:true, mudarProfessorClasse:true, arquivarEscalaAtual:true,
  verificarEncerramentoTrimestral:true, prepararProximoTrimestre:true,
  instalarAutomacaoTrimestral:true
};

function agoraFormatadoEBD() {
  return Utilities.formatDate(new Date(), TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss");
}

function obterPropriedadeSeguraEBD(chave, descricao) {
  const valor = String(PropertiesService.getScriptProperties().getProperty(chave) || "").trim();
  if (!valor) throw new Error("Configuração de segurança ausente: defina a propriedade do script " + chave + " (" + descricao + ").");
  return valor;
}

function hashCurtoEBD(valor) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(valor || ""));
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, "");
}

function compararSeguroEBD(a, b) {
  const x = hashCurtoEBD(a), y = hashCurtoEBD(b);
  if (x.length !== y.length) return false;
  let diferenca = 0;
  for (let i = 0; i < x.length; i++) diferenca |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diferenca === 0;
}

function chaveTokenEBD(tipo, token) { return "EBD_TOKEN_" + tipo + "_" + hashCurtoEBD(token); }
function gerarTokenEBD(tipo, ttl) {
  const token = Utilities.getUuid() + "." + Utilities.getUuid();
  CacheService.getScriptCache().put(chaveTokenEBD(tipo, token), "1", ttl);
  return token;
}
function tokenValidoEBD(tipo, token) {
  return Boolean(token) && CacheService.getScriptCache().get(chaveTokenEBD(tipo, token)) === "1";
}
function verificarLimiteLoginEBD(tipo) {
  const cache = CacheService.getScriptCache(), chave = "EBD_LOGIN_FALHAS_" + tipo;
  const falhas = Number(cache.get(chave) || 0);
  if (falhas >= LIMITE_FALHAS_LOGIN_EBD) throw new Error("Muitas tentativas incorretas. Aguarde alguns minutos e tente novamente.");
  return {cache:cache, chave:chave, falhas:falhas};
}
function registrarFalhaLoginEBD(c) { c.cache.put(c.chave, String(c.falhas + 1), TTL_FALHAS_LOGIN_EBD); Utilities.sleep(350); }
function limparFalhasLoginEBD(c) { c.cache.remove(c.chave); }

function validarAcessoAdmin(parametros) {
  const controle = verificarLimiteLoginEBD("ADMIN");
  const configurada = obterPropriedadeSeguraEBD(PROP_SENHA_ADMIN_EBD, "senha do painel administrativo");
  if (!compararSeguroEBD(parametros.senha || "", configurada)) {
    registrarFalhaLoginEBD(controle);
    return {sucesso:false, autenticado:false, mensagem:"Senha administrativa incorreta."};
  }
  limparFalhasLoginEBD(controle);
  return {sucesso:true, autenticado:true, tokenAdmin:gerarTokenEBD("ADMIN", TTL_TOKEN_ADMIN_EBD), expiraEmSegundos:TTL_TOKEN_ADMIN_EBD};
}

function validarAcessoTroca(parametros) {
  const controle = verificarLimiteLoginEBD("TROCA");
  const configurada = obterPropriedadeSeguraEBD(PROP_SENHA_TROCA_EBD, "senha pública para solicitar troca");
  if (!compararSeguroEBD(parametros.senha || "", configurada)) {
    registrarFalhaLoginEBD(controle);
    return {sucesso:false, autenticado:false, mensagem:"Senha de alteração incorreta."};
  }
  limparFalhasLoginEBD(controle);
  return {sucesso:true, autenticado:true, tokenTroca:gerarTokenEBD("TROCA", TTL_TOKEN_TROCA_EBD), expiraEmSegundos:TTL_TOKEN_TROCA_EBD};
}

function validarSenhaAdmin(parametros) {
  const token = String(parametros.tokenAdmin || parametros.token || parametros.senha || "").trim();
  if (!tokenValidoEBD("ADMIN", token)) throw new Error("Sessão administrativa expirada ou inválida. Entre novamente no painel.");
}
function validarTokenTrocaEBD(parametros) {
  const token = String(parametros.tokenTroca || parametros.token || "").trim();
  if (!tokenValidoEBD("TROCA", token)) throw new Error("Autorização de troca expirada ou inválida. Digite a senha novamente.");
}
function executarComLockEBD(funcao) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error("Outra alteração está sendo processada. Tente novamente em alguns segundos.");
  try { return funcao(); } finally { lock.releaseLock(); }
}

function normalizarNomeClasseEBD(nome) {
  const texto = String(nome || "").trim();

  if (!texto) {
    return "";
  }

  return MAPA_CLASSES_ANTIGAS_EBD[texto] || texto;
}

function ehColunaClasseEBD(nome) {
  const texto = String(nome || "").trim();

  if (!texto || texto === "Data" || texto === COLUNA_SUPORTE_EBD) {
    return false;
  }

  return CLASSES_ESCALA_EBD.indexOf(normalizarNomeClasseEBD(texto)) !== -1;
}

function classePermiteApoioRonanEBD(classe) {
  const classeNormalizada = normalizarNomeClasseEBD(classe);
  return CLASSES_APOIO_RONAN_EBD.indexOf(classeNormalizada) !== -1;
}

function ehSolicitacaoApoioRonanEBD(valor) {
  return String(valor || "").trim() === VALOR_APOIO_RONAN_EBD;
}

function montarCampoComApoioRonanEBD(valorAtual, professorAtual) {
  const valorTexto = String(valorAtual || "").trim();
  const professorTexto = String(professorAtual || "").trim();

  if (!valorTexto || !professorTexto) {
    throw new Error("Não foi possível identificar o professor atual para aplicar o apoio do Ronan.");
  }

  if (valorTexto.toLowerCase() === professorTexto.toLowerCase()) {
    return PROFESSOR_APOIO_RONAN_EBD;
  }

  const partes = valorTexto
    .split("/")
    .map(function (nome) {
      return nome.trim();
    })
    .filter(Boolean);

  let encontrouProfessor = false;
  const atualizados = [];

  partes.forEach(function (nome) {
    let novoNome = nome;

    if (nome.toLowerCase() === professorTexto.toLowerCase()) {
      novoNome = PROFESSOR_APOIO_RONAN_EBD;
      encontrouProfessor = true;
    }

    const jaExiste = atualizados.some(function (item) {
      return item.toLowerCase() === novoNome.toLowerCase();
    });

    if (!jaExiste) {
      atualizados.push(novoNome);
    }
  });

  if (!encontrouProfessor) {
    throw new Error("O professor selecionado não está mais nesta data. Atualize a página e tente novamente.");
  }

  return atualizados.join(" / ");
}

function encontrarIndiceClasseEscalaEBD(cabecalhos, classe) {
  const classeNormalizada = normalizarNomeClasseEBD(classe);

  for (let i = 0; i < cabecalhos.length; i++) {
    if (normalizarNomeClasseEBD(cabecalhos[i]) === classeNormalizada) {
      return i;
    }
  }

  return -1;
}

function obterValorLinhaEscalaEBD(linha, cabecalhos, colunaDesejada) {
  const colunaNormalizada = normalizarNomeClasseEBD(colunaDesejada);

  for (let i = 0; i < cabecalhos.length; i++) {
    if (colunaDesejada === "Data" && cabecalhos[i] === "Data") {
      return linha[i];
    }

    if (colunaDesejada === COLUNA_SUPORTE_EBD && cabecalhos[i] === COLUNA_SUPORTE_EBD) {
      return linha[i];
    }

    if (normalizarNomeClasseEBD(cabecalhos[i]) === colunaNormalizada) {
      return linha[i];
    }
  }

  return "";
}

function formatarValorEscalaEBD(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, TIMEZONE_EBD, "dd/MM/yyyy");
  }

  return valor === undefined || valor === null ? "" : String(valor).trim();
}


function doGet(e) {
  const parametros = e && e.parameter ? e.parameter : {};
  const acao = String(parametros.acao || "").trim();
  const callback = parametros.callback || "";
  let resposta;
  try {
    const executar = function () { return processarAcaoEBD(acao, parametros); };
    resposta = ACOES_ESCRITA_EBD[acao] ? executarComLockEBD(executar) : executar();
  } catch (erro) {
    resposta = {sucesso:false, mensagem:erro.message || "Erro inesperado no Apps Script."};
  }
  return responderSaida(resposta, callback);
}

function doPost(e) {
  const parametros = e && e.parameter ? e.parameter : {};
  let resposta;

  try {
    const acao = String(parametros.acao || "").trim();
    const executar = function () { return processarAcaoEBD(acao, parametros); };
    resposta = ACOES_ESCRITA_EBD[acao] ? executarComLockEBD(executar) : executar();
  } catch (erro) {
    resposta = {sucesso:false, mensagem:erro.message || "Erro inesperado ao salvar."};
  }

  resposta.requisicaoId = String(parametros.requisicaoId || "").trim();
  resposta.respondidoEm = agoraFormatadoEBD();
  return responderHtmlParaAdmin(resposta);
}

function processarAcaoEBD(acao, parametros) {
  if (acao === "listar") return listarEscala();
  if (acao === "validarAcessoAdmin") return validarAcessoAdmin(parametros);
  if (acao === "validarAcessoTroca") return validarAcessoTroca(parametros);
  if (acao === "trocar") { validarTokenTrocaEBD(parametros); return trocarProfessor(parametros); }
  if (acao === "historico") return listarHistorico(parametros);
  if (acao === "versao") return obterVersaoEscala();
  if (acao === "licoes") return listarLicoes();
  if (acao === "salvarLicoes") return salvarLicoes(parametros);
  if (acao === "migrarLicoesDrive") { validarSenhaAdmin(parametros); return migrarLicoesParaDriveInternoEBD(); }
  if (acao === "adminSalvarProfessor") return adminSalvarProfessor(parametros);
  if (acao === "adminAdicionarData") return adminAdicionarData(parametros);
  if (acao === "adminRemoverData") return adminRemoverData(parametros);
  if (acao === "adminRenomearClasse") return adminRenomearClasse(parametros);
  if (acao === "quizzes") return listarQuizzes();
  if (acao === "salvarQuizzes") return salvarQuizzes(parametros);
  if (acao === "listarProfessores") { validarSenhaAdmin(parametros); return listarProfessores(); }
  if (acao === "adicionarProfessor") return adicionarProfessor(parametros);
  if (acao === "atualizarProfessor") return atualizarProfessor(parametros);
  if (acao === "inativarProfessor") return inativarProfessor(parametros);
  if (acao === "substituirProfessor") return substituirProfessor(parametros);
  if (acao === "mudarProfessorClasse") return mudarProfessorClasse(parametros);
  if (acao === "arquivarEscalaAtual") return arquivarEscalaAtual(parametros);
  if (acao === "obterStatusTrimestral") { validarSenhaAdmin(parametros); return obterStatusTrimestralEBD(); }
  if (acao === "instalarAutomacaoTrimestral") return instalarAutomacaoTrimestralEBD(parametros);
  if (acao === "verificarEncerramentoTrimestral") return verificarEncerramentoTrimestralAdminEBD(parametros);
  if (acao === "prepararProximoTrimestre") return prepararProximoTrimestreEBD(parametros);
  if (acao === "consultarHistoricoEscalas") { validarSenhaAdmin(parametros); return consultarHistoricoEscalas(parametros); }
  return {sucesso:false, mensagem:"Ação inválida."};
}

function responderSaida(resposta, callback) {
  const conteudo = JSON.stringify(resposta);

  if (callback) {
    const callbackSeguro = String(callback || "").trim();
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callbackSeguro)) {
      return ContentService
        .createTextOutput(JSON.stringify({sucesso:false, mensagem:"Callback JSONP inválido."}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(callbackSeguro + "(" + conteudo + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(conteudo)
    .setMimeType(ContentService.MimeType.JSON);
}

function responderHtmlParaAdmin(resposta) {
  resposta.origem = "appsScriptSalvarLicoes";

  const json = JSON.stringify(resposta)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return HtmlService
    .createHtmlOutput(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            window.parent.postMessage(${json}, "*");
          </script>
        </body>
      </html>
    `)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function prepararPlanilhaEscalaEBD() {
  throw new Error("A preparação automática foi desativada para proteger a escala atual. Use a aba Escala EBD existente.");
}

function criarOuPrepararHistorico() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_HISTORICO);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_HISTORICO);
  }

  const cabecalhos = [
    "Data/Hora",
    "Classe",
    "Professor Solicitante",
    "Data Antiga",
    "Nova Data",
    "Professor Trocado",
    "Origem"
  ];

  if (aba.getLastRow() === 0) {
    aba.appendRow(cabecalhos);
  }

  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  aba.getRange(1, 1, 1, cabecalhos.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#5b21b6")
    .setHorizontalAlignment("center");

  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, cabecalhos.length);
}

// Funções estáveis da escala restauradas na Atualização 3.1.
function listarEscala() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) {
    return {
      sucesso: true,
      escala: []
    };
  }

  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const escala = [];

  for (let i = 1; i < dados.length; i++) {
    const linha = dados[i];

    if (!linha[0]) {
      continue;
    }

    const item = {};

    ORDEM_COLUNAS_ESCALA_EBD.forEach(function (cabecalho) {
      let valor = obterValorLinhaEscalaEBD(linha, cabecalhos, cabecalho);

      if (cabecalho === COLUNA_SUPORTE_EBD && !valor) {
        valor = "Ronan";
      }

      item[cabecalho] = formatarValorEscalaEBD(valor);
    });

    escala.push(item);
  }

  return {
    sucesso: true,
    escala: escala
  };
}

function trocarProfessor(parametros) {
  const classe = parametros.classe || "";
  const professor = parametros.professor || "";
  const dataAtual = parametros.dataAtual || "";
  const novaData = parametros.novaData || "";
  const origem = parametros.origem || "Site Escala EBD";

  if (!classe || !professor || !dataAtual || !novaData) {
    throw new Error("Dados incompletos para realizar a troca.");
  }

  if (ehSolicitacaoApoioRonanEBD(novaData)) {
    return trocarProfessorComApoioRonan(parametros);
  }

  if (dataAtual === novaData) {
    throw new Error("A nova data precisa ser diferente da data atual.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) {
    throw new Error("A escala está vazia.");
  }

  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");
  const indiceClasse = encontrarIndiceClasseEscalaEBD(cabecalhos, classe);

  if (indiceData === -1) {
    throw new Error("A coluna 'Data' não foi encontrada.");
  }

  if (indiceClasse === -1) {
    throw new Error("A coluna da classe '" + classe + "' não foi encontrada.");
  }

  let linhaDataAtual = -1;
  let linhaNovaData = -1;

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (dataLinha === dataAtual) {
      linhaDataAtual = i + 1;
    }

    if (dataLinha === novaData) {
      linhaNovaData = i + 1;
    }
  }

  if (linhaDataAtual === -1) {
    throw new Error("A data atual não foi encontrada na escala.");
  }

  if (linhaNovaData === -1) {
    throw new Error("A nova data não foi encontrada na escala.");
  }

  const professorNaDataAtual = String(
    aba.getRange(linhaDataAtual, indiceClasse + 1).getValue()
  ).trim();

  const professorNaNovaData = String(
    aba.getRange(linhaNovaData, indiceClasse + 1).getValue()
  ).trim();

  if (professorNaDataAtual !== professor) {
    throw new Error(
      "O professor selecionado não está mais nesta data. Atualize a página e tente novamente."
    );
  }

  aba.getRange(linhaDataAtual, indiceClasse + 1).setValue(professorNaNovaData);
  aba.getRange(linhaNovaData, indiceClasse + 1).setValue(professor);

  registrarHistorico({
    dataHora: new Date(),
    classe: classe,
    professorSolicitante: professor,
    dataAntiga: dataAtual,
    novaData: novaData,
    professorTrocado: professorNaNovaData,
    origem: origem
  });

  return {
    sucesso: true,
    mensagem: "Troca realizada com sucesso.",
    professorSolicitante: professor,
    professorTrocado: professorNaNovaData,
    dataAntiga: dataAtual,
    novaData: novaData,
    classe: classe
  };
}

function trocarProfessorComApoioRonan(parametros) {
  const classe = String(parametros.classe || "").trim();
  const professor = String(parametros.professor || "").trim();
  const dataAtual = String(parametros.dataAtual || "").trim();
  const origem = parametros.origem || "Site Escala EBD";

  if (!classe || !professor || !dataAtual) {
    throw new Error("Dados incompletos para solicitar apoio do Ronan.");
  }

  if (!classePermiteApoioRonanEBD(classe)) {
    throw new Error("O apoio do Ronan pela página pública está disponível apenas para Testemunhas de Cristo e Heróis da Fé.");
  }

  if (professor.toLowerCase() === PROFESSOR_APOIO_RONAN_EBD.toLowerCase()) {
    throw new Error("O Ronan já está selecionado como professor. Escolha o professor que precisa do apoio.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) {
    throw new Error("A escala está vazia.");
  }

  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");
  const indiceClasse = encontrarIndiceClasseEscalaEBD(cabecalhos, classe);

  if (indiceData === -1) {
    throw new Error("A coluna 'Data' não foi encontrada.");
  }

  if (indiceClasse === -1) {
    throw new Error("A coluna da classe '" + classe + "' não foi encontrada.");
  }

  let linhaDataAtual = -1;

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (dataLinha === dataAtual) {
      linhaDataAtual = i + 1;
      break;
    }
  }

  if (linhaDataAtual === -1) {
    throw new Error("A data atual não foi encontrada na escala.");
  }

  const valorAtual = String(
    aba.getRange(linhaDataAtual, indiceClasse + 1).getValue() || ""
  ).trim();

  const novoValor = montarCampoComApoioRonanEBD(valorAtual, professor);

  aba.getRange(linhaDataAtual, indiceClasse + 1).setValue(novoValor);

  garantirProfessorAtivo(
    PROFESSOR_APOIO_RONAN_EBD,
    normalizarNomeClasseEBD(classe),
    "Apoio disponível para substituição pela página pública"
  );

  registrarHistorico({
    dataHora: new Date(),
    classe: normalizarNomeClasseEBD(classe),
    professorSolicitante: professor,
    dataAntiga: dataAtual,
    novaData: dataAtual,
    professorTrocado: PROFESSOR_APOIO_RONAN_EBD + " assumiu como apoio no lugar de " + professor + ".",
    origem: origem + " - Apoio Ronan"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Apoio do Ronan aplicado com sucesso.",
    tipo: "apoioRonan",
    professorSolicitante: professor,
    professorTrocado: PROFESSOR_APOIO_RONAN_EBD,
    dataAntiga: dataAtual,
    novaData: dataAtual,
    classe: normalizarNomeClasseEBD(classe)
  };
}

function registrarHistorico(dados) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_HISTORICO);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_HISTORICO);

    aba.appendRow([
      "Data/Hora",
      "Classe",
      "Professor Solicitante",
      "Data Antiga",
      "Nova Data",
      "Professor Trocado",
      "Origem"
    ]);
  }

  aba.appendRow([
    Utilities.formatDate(dados.dataHora, TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss"),
    dados.classe,
    dados.professorSolicitante,
    dados.dataAntiga,
    dados.novaData,
    dados.professorTrocado,
    dados.origem
  ]);

  aba.autoResizeColumns(1, 7);
}

function listarHistorico(parametros) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_HISTORICO);

  const limite = Number(parametros && parametros.limite ? parametros.limite : 50) || 50;

  if (!aba) {
    return {
      sucesso: true,
      historico: []
    };
  }

  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) {
    return {
      sucesso: true,
      historico: []
    };
  }

  const historico = [];

  for (let i = dados.length - 1; i >= 1 && historico.length < limite; i--) {
    historico.push({
      dataHora: String(dados[i][0] || ""),
      classe: String(dados[i][1] || ""),
      professorSolicitante: String(dados[i][2] || ""),
      dataAntiga: String(dados[i][3] || ""),
      novaData: String(dados[i][4] || ""),
      professorTrocado: String(dados[i][5] || ""),
      origem: String(dados[i][6] || "")
    });
  }

  return {
    sucesso: true,
    historico: historico
  };
}

function obterVersaoEscala() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaEscala = planilha.getSheetByName(NOME_ABA_ESCALA);
  const abaHistorico = planilha.getSheetByName(NOME_ABA_HISTORICO);
  const abaLicoes = planilha.getSheetByName(NOME_ABA_LICOES);
  const abaProfessores = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const abaQuizzes = planilha.getSheetByName(NOME_ABA_QUIZZES);

  if (!abaEscala) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dadosEscala = abaEscala.getDataRange().getValues();
  const dadosHistorico = abaHistorico ? abaHistorico.getDataRange().getValues() : [];
  const dadosLicoes = abaLicoes ? abaLicoes.getDataRange().getValues() : [];
  const dadosProfessores = abaProfessores ? abaProfessores.getDataRange().getValues() : [];
  const dadosQuizzes = abaQuizzes ? abaQuizzes.getDataRange().getValues() : [];

  const texto = JSON.stringify({
    escala: dadosEscala,
    historico: dadosHistorico,
    licoes: dadosLicoes,
    professores: dadosProfessores,
    quizzes: dadosQuizzes
  });

  const hash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, texto)
  );

  return {
    sucesso: true,
    versao: hash
  };
}

function adminSalvarProfessor(parametros) {
  validarSenhaAdmin(parametros);

  const data = String(parametros.data || "").trim();
  const classe = String(parametros.classe || "").trim();
  const professor = String(parametros.professor || "").trim();

  if (!data || !classe || !professor) {
    throw new Error("Informe data, classe e professor.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();
  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");
  const indiceClasse = encontrarIndiceClasseEscalaEBD(cabecalhos, classe);

  if (indiceClasse === -1) {
    throw new Error("Classe não encontrada: " + classe);
  }

  let linhaEncontrada = -1;

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (dataLinha === data) {
      linhaEncontrada = i + 1;
      break;
    }
  }

  if (linhaEncontrada === -1) {
    throw new Error("Data não encontrada: " + data);
  }

  const professorAnterior = String(aba.getRange(linhaEncontrada, indiceClasse + 1).getValue() || "").trim();

  aba.getRange(linhaEncontrada, indiceClasse + 1).setValue(professor);

  registrarHistorico({
    dataHora: new Date(),
    classe: classe,
    professorSolicitante: "Administrador",
    dataAntiga: data,
    novaData: data,
    professorTrocado: "Alterou professor: " + professorAnterior + " → " + professor,
    origem: "Painel Admin - Alterar professor"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Professor alterado com sucesso."
  };
}

function adminAdicionarData(parametros) {
  validarSenhaAdmin(parametros);

  const data = String(parametros.data || "").trim();
  const camposTexto = parametros.campos || "{}";

  if (!data) {
    throw new Error("Informe a data.");
  }

  let campos;

  try {
    campos = JSON.parse(camposTexto);
  } catch (erro) {
    campos = {};
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();
  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (dataLinha === data) {
      throw new Error("Já existe uma escala cadastrada para a data " + data + ".");
    }
  }

  const novaLinha = cabecalhos.map(function (cabecalho) {
    if (cabecalho === "Data") {
      return data;
    }

    if (cabecalho === COLUNA_SUPORTE_EBD) {
      return campos[cabecalho] || "Ronan";
    }

    return campos[cabecalho] || campos[normalizarNomeClasseEBD(cabecalho)] || "";
  });

  aba.appendRow(novaLinha);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Escala",
    professorSolicitante: "Administrador",
    dataAntiga: "",
    novaData: data,
    professorTrocado: "Adicionou nova data na escala",
    origem: "Painel Admin - Adicionar data"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Nova data adicionada com sucesso."
  };
}

function adminRemoverData(parametros) {
  validarSenhaAdmin(parametros);

  const data = String(parametros.data || "").trim();

  if (!data) {
    throw new Error("Informe a data para remover.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();
  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");
  let linhaEncontrada = -1;

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (dataLinha === data) {
      linhaEncontrada = i + 1;
      break;
    }
  }

  if (linhaEncontrada === -1) {
    throw new Error("Data não encontrada: " + data);
  }

  aba.deleteRow(linhaEncontrada);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Escala",
    professorSolicitante: "Administrador",
    dataAntiga: data,
    novaData: "",
    professorTrocado: "Removeu data da escala",
    origem: "Painel Admin - Remover data"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Data removida com sucesso."
  };
}

function adminRenomearClasse(parametros) {
  validarSenhaAdmin(parametros);

  const classeAntiga = String(parametros.classeAntiga || "").trim();
  const classeNova = String(parametros.classeNova || "").trim();

  if (!classeAntiga || !classeNova) {
    throw new Error("Informe a classe atual e o novo nome.");
  }

  if (classeAntiga === "Data") {
    throw new Error("A coluna Data não pode ser renomeada.");
  }

  if (classeAntiga === COLUNA_SUPORTE_EBD) {
    throw new Error("Suporte é uma função, não uma classe para renomear.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(function (item) {
    return String(item).trim();
  });

  const indiceAntigo = encontrarIndiceClasseEscalaEBD(cabecalhos, classeAntiga);

  if (indiceAntigo === -1) {
    throw new Error("Classe não encontrada: " + classeAntiga);
  }

  if (encontrarIndiceClasseEscalaEBD(cabecalhos, classeNova) !== -1 && normalizarNomeClasseEBD(classeAntiga) !== normalizarNomeClasseEBD(classeNova)) {
    throw new Error("Já existe uma classe com o nome: " + classeNova);
  }

  aba.getRange(1, indiceAntigo + 1).setValue(classeNova);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Escala",
    professorSolicitante: "Administrador",
    dataAntiga: "",
    novaData: "",
    professorTrocado: "Renomeou classe: " + classeAntiga + " → " + classeNova,
    origem: "Painel Admin - Renomear classe"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Classe renomeada com sucesso."
  };
}

function obterConfiguracaoArquivoLicaoEBD(classe) {
  const chave = String(classe || "").trim().toLowerCase();
  const configuracao = CONFIG_ARQUIVOS_LICOES_EBD[chave];

  if (!configuracao) {
    throw new Error("Classe de lição inválida: " + classe + ".");
  }

  return configuracao;
}

function obterConteudoPadraoLicaoEBD(classe) {
  return classe === "adultos" ? obterLicaoPadraoAdultos() : obterLicaoPadraoJovens();
}

function tamanhoConteudoLicaoEBD(conteudo) {
  return Utilities.newBlob(String(conteudo || ""), MimeType.HTML).getBytes().length;
}

function hashConteudoLicaoEBD(conteudo) {
  return hashCurtoEBD(String(conteudo || ""));
}

function lerConteudoArquivoLicaoEBD(arquivo) {
  return arquivo.getBlob().getDataAsString("UTF-8");
}

function lerLicoesLegadasDaPlanilhaEBD() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_LICOES);
  const resultado = {
    licoes: {
      adultos: obterLicaoPadraoAdultos(),
      jovens: obterLicaoPadraoJovens()
    },
    atualizadoEm: {
      adultos: "",
      jovens: ""
    },
    temConteudoLegado: false
  };

  if (!aba || aba.getLastRow() < 2) {
    return resultado;
  }

  const dados = aba.getDataRange().getValues();
  const cabecalhos = dados[0].map(function (valor) {
    return String(valor || "").trim();
  });
  const indiceClasse = cabecalhos.indexOf("Classe");
  const indiceConteudo = cabecalhos.indexOf("ConteudoHTML");
  const indiceAtualizado = cabecalhos.indexOf("AtualizadoEm");

  if (indiceClasse === -1 || indiceConteudo === -1) {
    return resultado;
  }

  for (let i = 1; i < dados.length; i++) {
    const classe = String(dados[i][indiceClasse] || "").trim().toLowerCase();

    if (!CONFIG_ARQUIVOS_LICOES_EBD[classe]) {
      continue;
    }

    const conteudo = String(dados[i][indiceConteudo] || "");
    if (conteudo.trim()) {
      resultado.licoes[classe] = conteudo;
      resultado.temConteudoLegado = true;
    }

    if (indiceAtualizado !== -1) {
      resultado.atualizadoEm[classe] = String(dados[i][indiceAtualizado] || "");
    }
  }

  return resultado;
}

function obterPastaLicoesDriveEBD(criarSeAusente) {
  const propriedades = PropertiesService.getScriptProperties();
  const pastaId = String(propriedades.getProperty(PROP_PASTA_LICOES_DRIVE_EBD) || "").trim();

  if (pastaId) {
    try {
      const pastaExistente = DriveApp.getFolderById(pastaId);
      if (!pastaExistente.isTrashed()) {
        return pastaExistente;
      }
    } catch (erroPasta) {
      console.warn("A pasta anterior das lições não pôde ser usada:", erroPasta);
    }
  }

  if (!criarSeAusente) {
    return null;
  }

  const pasta = DriveApp.createFolder(NOME_PASTA_LICOES_DRIVE_EBD);
  pasta.setDescription("Arquivos atuais das lições do sistema Escala EBD. Cada atualização substitui o conteúdo anterior.");
  propriedades.setProperty(PROP_PASTA_LICOES_DRIVE_EBD, pasta.getId());
  return pasta;
}

function obterArquivoLicaoDriveEBD(classe, criarSeAusente, conteudoInicial) {
  const configuracao = obterConfiguracaoArquivoLicaoEBD(classe);
  const propriedades = PropertiesService.getScriptProperties();
  const arquivoId = String(propriedades.getProperty(configuracao.propriedade) || "").trim();

  if (arquivoId) {
    try {
      const arquivoExistente = DriveApp.getFileById(arquivoId);
      if (!arquivoExistente.isTrashed()) {
        return arquivoExistente;
      }
    } catch (erroArquivo) {
      console.warn("O arquivo anterior da lição " + classe + " não pôde ser usado:", erroArquivo);
    }
  }

  if (!criarSeAusente) {
    return null;
  }

  const pasta = obterPastaLicoesDriveEBD(true);
  const conteudo = String(conteudoInicial || obterConteudoPadraoLicaoEBD(classe));
  const blob = Utilities.newBlob(conteudo, MimeType.HTML, configuracao.nome);
  const arquivo = pasta.createFile(blob);
  arquivo.setDescription("Versão atual da lição " + classe + " do sistema Escala EBD. O conteúdo anterior é substituído a cada atualização.");
  propriedades.setProperty(configuracao.propriedade, arquivo.getId());
  return arquivo;
}

function obterEstadoArquivosLicoesDriveEBD(criarSeAusente, licoesIniciais) {
  const iniciais = licoesIniciais || {};
  const estado = {
    arquivos: {},
    licoes: {},
    metadados: {}
  };

  ["adultos", "jovens"].forEach(function (classe) {
    const arquivo = obterArquivoLicaoDriveEBD(classe, criarSeAusente, iniciais[classe]);

    if (!arquivo) {
      return;
    }

    const conteudo = lerConteudoArquivoLicaoEBD(arquivo);
    estado.arquivos[classe] = arquivo;
    estado.licoes[classe] = conteudo;
    estado.metadados[classe] = montarMetadadosArquivoLicaoEBD(classe, arquivo, conteudo);
  });

  return estado;
}

function montarMetadadosArquivoLicaoEBD(classe, arquivo, conteudo) {
  const configuracao = obterConfiguracaoArquivoLicaoEBD(classe);
  const dataAtualizacao = arquivo.getLastUpdated();

  return {
    classe: classe,
    arquivoDriveId: arquivo.getId(),
    nomeArquivo: configuracao.nome,
    atualizadoEm: Utilities.formatDate(dataAtualizacao, TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss"),
    tamanhoBytes: tamanhoConteudoLicaoEBD(conteudo),
    hashSHA256: hashConteudoLicaoEBD(conteudo),
    armazenamento: "Google Drive",
    urlDrive: arquivo.getUrl()
  };
}

function atualizarAbaMetadadosLicoesEBD(metadados) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA_LICOES);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_LICOES);
  }

  const cabecalhos = [
    "Classe",
    "ArquivoDriveId",
    "NomeArquivo",
    "AtualizadoEm",
    "TamanhoBytes",
    "HashSHA256",
    "Armazenamento",
    "URLDrive"
  ];

  const linhas = ["adultos", "jovens"].map(function (classe) {
    const item = metadados[classe];
    return [
      classe,
      item.arquivoDriveId,
      item.nomeArquivo,
      item.atualizadoEm,
      item.tamanhoBytes,
      item.hashSHA256,
      item.armazenamento,
      item.urlDrive
    ];
  });

  aba.clearContents();
  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  aba.getRange(2, 1, linhas.length, cabecalhos.length).setValues(linhas);
  aba.getRange(1, 1, 1, cabecalhos.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1f4e79")
    .setHorizontalAlignment("center");
  aba.getRange(2, 1, linhas.length, cabecalhos.length).setVerticalAlignment("middle");
  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, cabecalhos.length);
  aba.setColumnWidth(2, 220);
  aba.setColumnWidth(6, 220);
  aba.setColumnWidth(8, 280);
}

function migrarLicoesParaDriveInternoEBD() {
  const legado = lerLicoesLegadasDaPlanilhaEBD();
  const estado = obterEstadoArquivosLicoesDriveEBD(true, legado.licoes);

  if (!estado.arquivos.adultos || !estado.arquivos.jovens) {
    throw new Error("Não foi possível criar os dois arquivos atuais das lições no Google Drive.");
  }

  ["adultos", "jovens"].forEach(function (classe) {
    let conteudo = String(estado.licoes[classe] || "");

    if (!conteudo.trim() && String(legado.licoes[classe] || "").trim()) {
      estado.arquivos[classe].setContent(legado.licoes[classe]);
      conteudo = lerConteudoArquivoLicaoEBD(estado.arquivos[classe]);
      estado.licoes[classe] = conteudo;
      estado.metadados[classe] = montarMetadadosArquivoLicaoEBD(classe, estado.arquivos[classe], conteudo);
    }

    if (!conteudo.trim()) {
      throw new Error("O arquivo da lição " + classe + " foi criado sem conteúdo.");
    }
  });

  atualizarAbaMetadadosLicoesEBD(estado.metadados);
  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: legado.temConteudoLegado
      ? "Lições migradas para o Google Drive. A aba Licoes agora contém somente metadados."
      : "Armazenamento das lições no Google Drive preparado com sucesso.",
    armazenamento: "google_drive",
    metadados: estado.metadados
  };
}

// Execute esta função uma vez no editor do Apps Script após instalar esta versão.
// Ela solicita a permissão do Google Drive, cria os dois arquivos atuais e migra
// o conteúdo que ainda estiver na aba Licoes.
function migrarLicoesParaDriveEBD() {
  return executarComLockEBD(function () {
    return migrarLicoesParaDriveInternoEBD();
  });
}

function temConfiguracaoDriveLicoesEBD() {
  const propriedades = PropertiesService.getScriptProperties();
  return Boolean(
    String(propriedades.getProperty(CONFIG_ARQUIVOS_LICOES_EBD.adultos.propriedade) || "").trim() ||
    String(propriedades.getProperty(CONFIG_ARQUIVOS_LICOES_EBD.jovens.propriedade) || "").trim()
  );
}

function listarLicoes() {
  let erroLeituraDrive = null;

  try {
    const estadoDrive = obterEstadoArquivosLicoesDriveEBD(false, {});

    if (estadoDrive.arquivos.adultos && estadoDrive.arquivos.jovens) {
      return {
        sucesso: true,
        licoes: estadoDrive.licoes,
        atualizadoEm: estadoDrive.metadados.adultos.atualizadoEm + " / " + estadoDrive.metadados.jovens.atualizadoEm,
        armazenamento: "google_drive",
        metadados: estadoDrive.metadados,
        versaoBackend: VERSAO_BACKEND_EBD
      };
    }
  } catch (erroDrive) {
    erroLeituraDrive = erroDrive;
    console.warn("Não foi possível ler as lições no Google Drive. Tentando a estrutura legada:", erroDrive);
  }

  const legado = lerLicoesLegadasDaPlanilhaEBD();

  if (!legado.temConteudoLegado && temConfiguracaoDriveLicoesEBD()) {
    return {
      sucesso: false,
      mensagem: "Os arquivos das lições estão configurados no Google Drive, mas não puderam ser lidos agora: " + (erroLeituraDrive ? erroLeituraDrive.message : "arquivos indisponíveis"),
      armazenamento: "google_drive_indisponivel",
      versaoBackend: VERSAO_BACKEND_EBD
    };
  }

  return {
    sucesso: true,
    licoes: legado.licoes,
    atualizadoEm: legado.atualizadoEm.adultos || legado.atualizadoEm.jovens || "",
    armazenamento: "planilha_legado",
    migracaoNecessaria: true,
    mensagem: "As lições ainda estão na estrutura antiga da planilha. Execute migrarLicoesParaDriveEBD no editor do Apps Script.",
    versaoBackend: VERSAO_BACKEND_EBD
  };
}

function sanitizarHtmlLicaoEBD(html) {
  let conteudo = String(html || "");
  conteudo = conteudo.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
  conteudo = conteudo.replace(/<(iframe|object|embed|applet|base|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  conteudo = conteudo.replace(/<(iframe|object|embed|applet|base|form)\b[^>]*\/?>/gi, "");
  conteudo = conteudo.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  conteudo = conteudo.replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
  return conteudo.trim();
}

function validarTamanhoLicaoEBD(classe, conteudo) {
  const tamanho = tamanhoConteudoLicaoEBD(conteudo);

  if (tamanho > LIMITE_ARQUIVO_LICAO_BYTES_EBD) {
    throw new Error("A lição " + classe + " ultrapassa o limite seguro de 9 MB.");
  }

  return tamanho;
}

function conferirGravacaoLicoesDriveEBD(esperados, maxTentativas) {
  const tentativas = Math.max(1, Number(maxTentativas || 5));
  let ultimoEstado = null;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    ultimoEstado = obterEstadoArquivosLicoesDriveEBD(false, {});

    const adultosOk = !esperados.adultos ||
      hashConteudoLicaoEBD(ultimoEstado.licoes.adultos) === hashConteudoLicaoEBD(esperados.adultos);
    const jovensOk = !esperados.jovens ||
      hashConteudoLicaoEBD(ultimoEstado.licoes.jovens) === hashConteudoLicaoEBD(esperados.jovens);

    if (adultosOk && jovensOk) {
      return ultimoEstado;
    }

    if (tentativa < tentativas) {
      Utilities.sleep(400 * tentativa);
    }
  }

  throw new Error(
    "O Google Drive não confirmou integralmente a gravação das lições após " +
    tentativas + " tentativas. O conteúdo anterior será restaurado."
  );
}

function salvarLicoes(parametros) {
  validarSenhaAdmin(parametros);

  const adultos = sanitizarHtmlLicaoEBD(parametros.adultos || "");
  const jovens = sanitizarHtmlLicaoEBD(parametros.jovens || "");

  if (!adultos && !jovens) {
    throw new Error("Nenhuma lição foi recebida para salvar.");
  }

  if (adultos) validarTamanhoLicaoEBD("adultos", adultos);
  if (jovens) validarTamanhoLicaoEBD("jovens", jovens);

  const legado = lerLicoesLegadasDaPlanilhaEBD();
  const estado = obterEstadoArquivosLicoesDriveEBD(true, legado.licoes);
  const anteriores = {
    adultos: estado.licoes.adultos,
    jovens: estado.licoes.jovens
  };
  const alterados = [];

  try {
    if (adultos) {
      estado.arquivos.adultos.setContent(adultos);
      alterados.push("adultos");
    }

    if (jovens) {
      estado.arquivos.jovens.setContent(jovens);
      alterados.push("jovens");
    }

    const conferido = conferirGravacaoLicoesDriveEBD({
      adultos: adultos,
      jovens: jovens
    }, 5);

    atualizarAbaMetadadosLicoesEBD(conferido.metadados);
    SpreadsheetApp.flush();

    return {
      sucesso: true,
      mensagem: "Lições atuais substituídas e conferidas no Google Drive.",
      atualizadoEm: agoraFormatadoEBD(),
      armazenamento: "google_drive",
      metadados: conferido.metadados,
      versaoBackend: VERSAO_BACKEND_EBD
    };
  } catch (erroSalvar) {
    alterados.forEach(function (classe) {
      try {
        estado.arquivos[classe].setContent(anteriores[classe]);
      } catch (erroRollback) {
        console.error("Falha ao restaurar a lição " + classe + ":", erroRollback);
      }
    });

    throw erroSalvar;
  }
}

function criarOuPrepararQuizzes() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_QUIZZES);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_QUIZZES);
  }

  const cabecalhos = ["Classe", "Link", "AtualizadoEm"];

  if (aba.getLastRow() === 0) {
    const agora = Utilities.formatDate(new Date(), TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss");

    aba.appendRow(cabecalhos);
    aba.appendRow([
      "adultos",
      "https://ebdfiel.github.io/Quizzes-ClaseAdultos-2026/trimestre-02/licao-07/",
      agora
    ]);
    aba.appendRow([
      "jovens",
      "https://ebdfiel.github.io/Quizzes-ConectarJovens-/trimestre-02/licao-07/index.html",
      agora
    ]);
  }

  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  aba.getRange(1, 1, 1, cabecalhos.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1f4e79")
    .setHorizontalAlignment("center");

  aba.setFrozenRows(1);
  aba.setColumnWidths(1, 1, 160);
  aba.setColumnWidths(2, 1, 540);
  aba.setColumnWidths(3, 1, 180);
}

function listarQuizzes() {
  criarOuPrepararQuizzes();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_QUIZZES);
  const dados = aba.getDataRange().getValues();

  const quizzes = {
    adultos: "",
    jovens: ""
  };

  for (let i = 1; i < dados.length; i++) {
    const classe = String(dados[i][0] || "").trim();
    const link = String(dados[i][1] || "").trim();

    if (classe) {
      quizzes[classe] = link;
    }
  }

  return {
    sucesso: true,
    quizzes: quizzes
  };
}

function salvarQuizzes(parametros) {
  validarSenhaAdmin(parametros);
  criarOuPrepararQuizzes();

  const linkAdultos = String(parametros.adultos || "").trim();
  const linkJovens = String(parametros.jovens || "").trim();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_QUIZZES);
  const agora = Utilities.formatDate(new Date(), TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss");

  const dados = aba.getDataRange().getValues();
  const linhas = {};

  for (let i = 1; i < dados.length; i++) {
    const classe = String(dados[i][0] || "").trim();
    if (classe) {
      linhas[classe] = i + 1;
    }
  }

  function salvarLinha(classe, link) {
    if (linhas[classe]) {
      aba.getRange(linhas[classe], 2).setValue(link);
      aba.getRange(linhas[classe], 3).setValue(agora);
    } else {
      aba.appendRow([classe, link, agora]);
    }
  }

  salvarLinha("adultos", linkAdultos);
  salvarLinha("jovens", linkJovens);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Quizzes",
    professorSolicitante: "Administrador",
    dataAntiga: "",
    novaData: "",
    professorTrocado: "Atualizou links dos quizzes da semana.",
    origem: "Painel Admin - Quizzes"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Links dos quizzes salvos com sucesso.",
    quizzes: {
      adultos: linkAdultos,
      jovens: linkJovens
    },
    atualizadoEm: agora
  };
}


function criarOuPrepararProfessores() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  if (!aba) aba = planilha.insertSheet(NOME_ABA_PROFESSORES);

  const headers = ["Nome", "Classe", "Status", "Telefone", "Observacao", "AtualizadoEm"];
  const dados = aba.getLastRow() ? aba.getDataRange().getValues() : [];
  if (!dados.length) {
    aba.getRange(1, 1, 1, headers.length).setValues([headers]);
    popularProfessoresDaEscala(aba);
  } else {
    const antigos = dados[0].map(function(v){ return String(v || "").trim(); });
    function indice(nome, ocorrencia) {
      let vistos = 0;
      for (let i = 0; i < antigos.length; i++) {
        if (antigos[i].toLowerCase() === nome.toLowerCase()) {
          vistos++;
          if (!ocorrencia || vistos === ocorrencia) return i;
        }
      }
      return -1;
    }
    const iNome=indice("Nome"), iClasse=indice("Classe"), iStatus=indice("Status"), iTel=indice("Telefone"), iObs=indice("Observacao"), iAt1=indice("AtualizadoEm",1), iAt2=indice("AtualizadoEm",2);
    const linhas=[];
    for (let r=1; r<dados.length; r++) {
      const nome=String(iNome>=0 ? dados[r][iNome] || "" : "").trim();
      if (!nome) continue;
      let atualizado=iAt1>=0 ? dados[r][iAt1] : "";
      if (!atualizado && iAt2>=0) atualizado=dados[r][iAt2];
      linhas.push([
        nome,
        normalizarNomeClasseEBD(iClasse>=0 ? dados[r][iClasse] : ""),
        String(iStatus>=0 ? dados[r][iStatus] || "Ativo" : "Ativo").trim() || "Ativo",
        normalizarTelefoneEBD(iTel>=0 ? dados[r][iTel] : ""),
        String(iObs>=0 ? dados[r][iObs] || "" : "").trim(),
        atualizado || agoraFormatadoEBD()
      ]);
    }
    aba.clearContents();
    aba.getRange(1,1,1,headers.length).setValues([headers]);
    if (linhas.length) aba.getRange(2,1,linhas.length,headers.length).setValues(linhas);
  }
  aba.getRange(1,1,1,headers.length).setFontWeight("bold").setFontColor("#ffffff").setBackground("#1f4e79").setHorizontalAlignment("center");
  aba.setFrozenRows(1);
  [220,220,110,170,320,180].forEach(function(w,i){ aba.setColumnWidth(i+1,w); });
  aba.getRange(1,1,Math.max(aba.getLastRow(),2),headers.length).setVerticalAlignment("top").setWrap(true);
}

function normalizarTelefoneEBD(valor) {
  let digitos=String(valor || "").replace(/\D/g, "");
  if ((digitos.length===10 || digitos.length===11) && digitos.indexOf("55")!==0) digitos="55"+digitos;
  return digitos;
}

function popularProfessoresDaEscala(abaProfessores) {
  const aba=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_ESCALA);
  if (!aba) return;
  const dados=aba.getDataRange().getValues();
  if (dados.length<2) return;
  const headers=dados[0].map(function(v){ return String(v || "").trim(); });
  const vistos={}, agora=agoraFormatadoEBD();
  for (let c=1;c<headers.length;c++) {
    const classe=normalizarNomeClasseEBD(headers[c]);
    if (!ehColunaClasseEBD(classe)) continue;
    for (let r=1;r<dados.length;r++) {
      String(dados[r][c] || "").split("/").map(function(v){return v.trim();}).filter(Boolean).forEach(function(nome){
        const k=nome.toLowerCase(); if (vistos[k]) return; vistos[k]=true;
        abaProfessores.appendRow([nome,classe,"Ativo","","Importado da escala atual",agora]);
      });
    }
  }
}

function listarProfessores() {
  criarOuPrepararProfessores();
  const dados=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PROFESSORES).getDataRange().getValues();
  const professores=[];
  for (let i=1;i<dados.length;i++) {
    const nome=String(dados[i][0] || "").trim(); if (!nome) continue;
    professores.push({nome:nome,classe:String(dados[i][1] || "").trim(),status:String(dados[i][2] || "Ativo").trim(),telefone:String(dados[i][3] || "").trim(),observacao:String(dados[i][4] || "").trim(),atualizadoEm:formatarValorEscalaEBD(dados[i][5])});
  }
  professores.sort(function(a,b){return a.nome.localeCompare(b.nome,"pt-BR");});
  return {sucesso:true,professores:professores};
}

function encontrarLinhaProfessor(aba,nome) {
  const dados=aba.getDataRange().getValues(), busca=String(nome || "").trim().toLowerCase();
  for (let i=1;i<dados.length;i++) if (String(dados[i][0] || "").trim().toLowerCase()===busca) return i+1;
  return -1;
}

function adicionarProfessor(parametros) {
  validarSenhaAdmin(parametros); criarOuPrepararProfessores();
  const nome=String(parametros.nome || "").trim(); if (!nome) throw new Error("Informe o nome do professor.");
  const aba=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PROFESSORES);
  if (encontrarLinhaProfessor(aba,nome)>-1) throw new Error("Este professor já está cadastrado: "+nome);
  aba.appendRow([nome,normalizarNomeClasseEBD(parametros.classe || ""),String(parametros.status || "Ativo").trim() || "Ativo",normalizarTelefoneEBD(parametros.telefone || ""),String(parametros.observacao || "").trim(),agoraFormatadoEBD()]);
  registrarHistorico({dataHora:new Date(),classe:"Professores",professorSolicitante:"Administrador",dataAntiga:"",novaData:"",professorTrocado:"Adicionou professor: "+nome,origem:"Painel Admin - Professores"});
  SpreadsheetApp.flush(); return {sucesso:true,mensagem:"Professor cadastrado com sucesso."};
}

function atualizarProfessor(parametros) {
  validarSenhaAdmin(parametros); criarOuPrepararProfessores();
  const original=String(parametros.nomeOriginal || "").trim(), nome=String(parametros.nome || "").trim();
  if (!original || !nome) throw new Error("Informe o professor para atualizar.");
  const aba=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PROFESSORES), linha=encontrarLinhaProfessor(aba,original);
  if (linha===-1) throw new Error("Professor não encontrado: "+original);
  if (original.toLowerCase()!==nome.toLowerCase() && encontrarLinhaProfessor(aba,nome)>-1) throw new Error("Já existe outro professor com o nome: "+nome);
  aba.getRange(linha,1,1,6).setValues([[nome,normalizarNomeClasseEBD(parametros.classe || ""),String(parametros.status || "Ativo").trim() || "Ativo",normalizarTelefoneEBD(parametros.telefone || ""),String(parametros.observacao || "").trim(),agoraFormatadoEBD()]]);
  registrarHistorico({dataHora:new Date(),classe:"Professores",professorSolicitante:"Administrador",dataAntiga:original,novaData:nome,professorTrocado:"Atualizou cadastro: "+nome,origem:"Painel Admin - Professores"});
  SpreadsheetApp.flush(); return {sucesso:true,mensagem:"Cadastro do professor atualizado com sucesso."};
}

function inativarProfessorInternoEBD(nome,observacao) {
  criarOuPrepararProfessores();
  const aba=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PROFESSORES), linha=encontrarLinhaProfessor(aba,nome);
  if (linha===-1) throw new Error("Professor não encontrado: "+nome);
  aba.getRange(linha,3).setValue("Inativo"); aba.getRange(linha,5).setValue(observacao || "Professor inativado pelo administrador."); aba.getRange(linha,6).setValue(agoraFormatadoEBD());
}
function inativarProfessor(parametros) {
  validarSenhaAdmin(parametros); const nome=String(parametros.nome || "").trim(); if (!nome) throw new Error("Informe o professor para inativar.");
  inativarProfessorInternoEBD(nome,String(parametros.observacao || "").trim());
  registrarHistorico({dataHora:new Date(),classe:"Professores",professorSolicitante:"Administrador",dataAntiga:"Ativo",novaData:"Inativo",professorTrocado:"Inativou professor: "+nome,origem:"Painel Admin - Professores"});
  SpreadsheetApp.flush(); return {sucesso:true,mensagem:"Professor inativado com sucesso."};
}

function garantirProfessorAtivo(nome,classe,observacao) {
  if (!nome) return; criarOuPrepararProfessores();
  const aba=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PROFESSORES), linha=encontrarLinhaProfessor(aba,nome);
  if (linha===-1) { aba.appendRow([nome,normalizarNomeClasseEBD(classe || ""),"Ativo","",observacao || "Criado automaticamente pelo painel",agoraFormatadoEBD()]); return; }
  aba.getRange(linha,3).setValue("Ativo"); aba.getRange(linha,6).setValue(agoraFormatadoEBD()); if (classe) aba.getRange(linha,2).setValue(normalizarNomeClasseEBD(classe));
}

function dataEhFuturaOuHoje(dataTexto) {
  const partes = String(dataTexto || "").split("/");

  if (partes.length !== 3) {
    return true;
  }

  const data = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return data >= hoje;
}

function substituirNomeNoCampo(valor, antigo, novo) {
  const partes = String(valor || "")
    .split("/")
    .map(function (nome) {
      return nome.trim();
    })
    .filter(Boolean);

  let alterou = false;

  const atualizados = partes.map(function (nome) {
    if (nome.toLowerCase() === antigo.toLowerCase()) {
      alterou = true;
      return novo;
    }

    return nome;
  });

  return {
    alterou: alterou,
    valor: atualizados.join(" / ")
  };
}

function substituirProfessor(parametros) {
  validarSenhaAdmin(parametros);

  const professorAntigo = String(parametros.professorAntigo || "").trim();
  const professorNovo = String(parametros.professorNovo || "").trim();
  const classe = String(parametros.classe || "").trim();
  const alcance = String(parametros.alcance || "futuras").trim();
  const inativarAntigo = String(parametros.inativarAntigo || "nao").trim();

  if (!professorAntigo || !professorNovo) {
    throw new Error("Informe o professor que saiu e o novo professor.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) {
    throw new Error("A escala está vazia.");
  }

  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const indiceData = cabecalhos.indexOf("Data");
  const classesParaAlterar = classe && classe !== "Todas as classes"
    ? [classe]
    : cabecalhos.filter(function (item) { return ehColunaClasseEBD(item); });

  let alteracoes = 0;

  for (let i = 1; i < dados.length; i++) {
    let dataLinha = dados[i][indiceData];

    if (dataLinha instanceof Date) {
      dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
    } else {
      dataLinha = String(dataLinha).trim();
    }

    if (alcance === "futuras" && !dataEhFuturaOuHoje(dataLinha)) {
      continue;
    }

    classesParaAlterar.forEach(function (classeAtual) {
      const indiceClasse = encontrarIndiceClasseEscalaEBD(cabecalhos, classeAtual);

      if (indiceClasse === -1) {
        return;
      }

      const valorAtual = String(aba.getRange(i + 1, indiceClasse + 1).getValue() || "").trim();
      const resultado = substituirNomeNoCampo(valorAtual, professorAntigo, professorNovo);

      if (resultado.alterou) {
        aba.getRange(i + 1, indiceClasse + 1).setValue(resultado.valor);
        alteracoes++;
      }
    });
  }

  garantirProfessorAtivo(professorNovo, classe && classe !== "Todas as classes" ? classe : "", "Substituiu " + professorAntigo);

  if (inativarAntigo === "sim") {
    inativarProfessorInternoEBD(professorAntigo, "Substituído por " + professorNovo);
  }

  registrarHistorico({
    dataHora: new Date(),
    classe: classe || "Todas as classes",
    professorSolicitante: "Administrador",
    dataAntiga: alcance === "futuras" ? "Datas futuras" : "Toda a escala",
    novaData: "",
    professorTrocado: "Substituiu " + professorAntigo + " por " + professorNovo + " em " + alteracoes + " ocorrência(s).",
    origem: "Painel Admin - Substituir professor"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Substituição concluída. Ocorrências alteradas: " + alteracoes + "."
  };
}

function moverNomeEntreCampos(valorOrigem, valorDestino, professor) {
  const origem = String(valorOrigem || "")
    .split("/")
    .map(function (nome) { return nome.trim(); })
    .filter(Boolean);

  const destino = String(valorDestino || "")
    .split("/")
    .map(function (nome) { return nome.trim(); })
    .filter(Boolean);

  const novaOrigem = origem.filter(function (nome) {
    return nome.toLowerCase() !== professor.toLowerCase();
  });

  const existeNoDestino = destino.some(function (nome) {
    return nome.toLowerCase() === professor.toLowerCase();
  });

  if (!existeNoDestino) {
    destino.push(professor);
  }

  return {
    origem: novaOrigem.join(" / "),
    destino: destino.join(" / ")
  };
}

function mudarProfessorClasse(parametros) {
  validarSenhaAdmin(parametros);

  const professor = String(parametros.professor || "").trim();
  const classeNova = String(parametros.classeNova || "").trim();
  const aplicarEscala = String(parametros.aplicarEscala || "nao").trim();

  if (!professor || !classeNova) {
    throw new Error("Informe o professor e a nova classe.");
  }

  criarOuPrepararProfessores();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaProfessores = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const linhaProfessor = encontrarLinhaProfessor(abaProfessores, professor);
  const agora = Utilities.formatDate(new Date(), TIMEZONE_EBD, "dd/MM/yyyy HH:mm:ss");

  if (linhaProfessor === -1) {
    abaProfessores.appendRow([professor, classeNova, "Ativo", "", "Criado ao mudar professor de classe", agora]);
  } else {
    abaProfessores.getRange(linhaProfessor, 2).setValue(classeNova);
    abaProfessores.getRange(linhaProfessor, 3).setValue("Ativo");
    abaProfessores.getRange(linhaProfessor, 6).setValue(agora);
  }

  let alteracoes = 0;

  if (aplicarEscala !== "nao") {
    const abaEscala = planilha.getSheetByName(NOME_ABA_ESCALA);

    if (!abaEscala) {
      throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
    }

    const dados = abaEscala.getDataRange().getValues();
    const cabecalhos = dados[0].map(function (item) {
      return String(item).trim();
    });

    const indiceData = cabecalhos.indexOf("Data");
    const indiceClasseNova = encontrarIndiceClasseEscalaEBD(cabecalhos, classeNova);

    if (indiceClasseNova === -1) {
      throw new Error("A nova classe não existe na escala: " + classeNova);
    }

    for (let i = 1; i < dados.length; i++) {
      let dataLinha = dados[i][indiceData];

      if (dataLinha instanceof Date) {
        dataLinha = Utilities.formatDate(dataLinha, TIMEZONE_EBD, "dd/MM/yyyy");
      } else {
        dataLinha = String(dataLinha).trim();
      }

      if (aplicarEscala === "futuras" && !dataEhFuturaOuHoje(dataLinha)) {
        continue;
      }

      for (let col = 1; col < cabecalhos.length; col++) {
        if (col === indiceClasseNova || !ehColunaClasseEBD(cabecalhos[col])) {
          continue;
        }

        const valorOrigem = String(abaEscala.getRange(i + 1, col + 1).getValue() || "").trim();
        const contem = valorOrigem.split("/").map(function (nome) {
          return nome.trim().toLowerCase();
        }).indexOf(professor.toLowerCase()) !== -1;

        if (!contem) {
          continue;
        }

        const valorDestino = String(abaEscala.getRange(i + 1, indiceClasseNova + 1).getValue() || "").trim();
        const movido = moverNomeEntreCampos(valorOrigem, valorDestino, professor);

        abaEscala.getRange(i + 1, col + 1).setValue(movido.origem);
        abaEscala.getRange(i + 1, indiceClasseNova + 1).setValue(movido.destino);
        alteracoes++;
      }
    }
  }

  registrarHistorico({
    dataHora: new Date(),
    classe: classeNova,
    professorSolicitante: "Administrador",
    dataAntiga: "",
    novaData: aplicarEscala === "nao" ? "Cadastro apenas" : aplicarEscala,
    professorTrocado: "Mudou professor de classe: " + professor + " → " + classeNova + ". Ocorrências movidas: " + alteracoes,
    origem: "Painel Admin - Mudar professor de classe"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Professor atualizado para a nova classe. Ocorrências movidas: " + alteracoes + "."
  };
}


function obterPlanilhaEBD() {
  const propriedades = PropertiesService.getScriptProperties();
  const idSalvo = String(propriedades.getProperty(PROP_PLANILHA_ID_EBD) || "").trim();
  if (idSalvo) return SpreadsheetApp.openById(idSalvo);

  const ativa = SpreadsheetApp.getActiveSpreadsheet();
  if (ativa) {
    propriedades.setProperty(PROP_PLANILHA_ID_EBD, ativa.getId());
    return ativa;
  }
  if (ID_PLANILHA_PADRAO_EBD) {
    propriedades.setProperty(PROP_PLANILHA_ID_EBD, ID_PLANILHA_PADRAO_EBD);
    return SpreadsheetApp.openById(ID_PLANILHA_PADRAO_EBD);
  }
  throw new Error("Não foi possível identificar a planilha da Escala EBD.");
}

function lerEstadoTrimestralEBD() {
  const texto = String(PropertiesService.getScriptProperties().getProperty(PROP_ESTADO_TRIMESTRAL_EBD) || "").trim();
  if (!texto) return {};
  try { return JSON.parse(texto) || {}; } catch (erro) { return {}; }
}

function salvarEstadoTrimestralEBD(estado) {
  PropertiesService.getScriptProperties().setProperty(PROP_ESTADO_TRIMESTRAL_EBD, JSON.stringify(estado || {}));
}

function criarOuPrepararHistoricoEscalasEBD() {
  const planilha = obterPlanilhaEBD();
  let aba = planilha.getSheetByName(NOME_ABA_HISTORICO_ESCALAS);
  if (!aba) aba = planilha.insertSheet(NOME_ABA_HISTORICO_ESCALAS);
  const headers = ["ID","Ano","Trimestre","Data","Classe","Professor","Suporte","Origem","Data do Arquivamento","Observação"];
  if (aba.getLastRow() === 0) aba.appendRow(headers);
  aba.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight("bold").setFontColor("#ffffff").setBackground("#1f4e79");
  aba.setFrozenRows(1);
  return aba;
}

function normalizarDataEBD(valor) {
  if (valor instanceof Date && !isNaN(valor.getTime())) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  const texto = String(valor || "").trim();
  const br = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return null;
}

function hojeEBD() {
  return normalizarDataEBD(Utilities.formatDate(new Date(), TIMEZONE_EBD, "dd/MM/yyyy"));
}

function obterPeriodoDataEBD(data) {
  const d = normalizarDataEBD(data);
  if (!d) throw new Error("Data inválida para identificar o trimestre.");
  return {ano:d.getFullYear(), trimestre:Math.floor(d.getMonth() / 3) + 1};
}

function rotuloTrimestreEBD(numero) {
  return String(numero) + "º Trimestre";
}

function codigoTrimestreEBD(trimestre) {
  const texto = String(trimestre || "").trim();
  const n = Number((texto.match(/[1-4]/) || [""])[0]);
  return n ? n + "T" : texto.replace(/\s+/g, "-");
}

function proximoPeriodoEBD(periodo) {
  return periodo.trimestre === 4
    ? {ano:periodo.ano + 1, trimestre:1}
    : {ano:periodo.ano, trimestre:periodo.trimestre + 1};
}

function obterDomingosTrimestreEBD(ano, trimestre) {
  const mesInicial = (Number(trimestre) - 1) * 3;
  const inicio = new Date(Number(ano), mesInicial, 1);
  const fim = new Date(Number(ano), mesInicial + 3, 1);
  const domingos = [];
  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  while (cursor.getDay() !== 0) cursor.setDate(cursor.getDate() + 1);
  while (cursor < fim) {
    domingos.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 7);
  }
  return domingos;
}

function obterDadosEscalaTrimestralEBD() {
  const planilha = obterPlanilhaEBD();
  const aba = planilha.getSheetByName(NOME_ABA_ESCALA);
  if (!aba) throw new Error("A aba '" + NOME_ABA_ESCALA + "' não foi encontrada.");
  const ultimaLinha = Math.max(aba.getLastRow(), 1);
  const ultimaColuna = Math.max(aba.getLastColumn(), ORDEM_COLUNAS_ESCALA_EBD.length);
  const dados = aba.getRange(1,1,ultimaLinha,ultimaColuna).getValues();
  const cabecalhos = dados[0].map(function(v){ return String(v || "").trim(); });
  const indiceData = cabecalhos.indexOf("Data");
  if (indiceData < 0) throw new Error("A coluna Data não foi encontrada na escala.");
  const linhas = [];
  for (let i=1; i<dados.length; i++) {
    const data = normalizarDataEBD(dados[i][indiceData]);
    if (!data) continue;
    linhas.push({linha:i+1, data:data, valores:dados[i]});
  }
  linhas.sort(function(a,b){ return a.data.getTime() - b.data.getTime(); });
  if (!linhas.length) throw new Error("A escala atual não possui datas válidas.");
  const primeiraData = linhas[0].data;
  const ultimaData = linhas[linhas.length - 1].data;
  const periodoInicial = obterPeriodoDataEBD(primeiraData);
  const periodoFinal = obterPeriodoDataEBD(ultimaData);
  if (periodoInicial.ano !== periodoFinal.ano || periodoInicial.trimestre !== periodoFinal.trimestre) {
    throw new Error("A escala atual contém datas de mais de um trimestre. Corrija as datas antes de arquivar.");
  }
  return {planilha:planilha, aba:aba, dados:dados, cabecalhos:cabecalhos, linhas:linhas, primeiraData:primeiraData, ultimaData:ultimaData, periodo:periodoFinal};
}

function separarNomesEscalaEBD(valor) {
  return String(valor || "").split("/").map(function(nome){ return nome.trim(); }).filter(Boolean);
}

function obterOrdemProfessoresEBD(infoEscala) {
  criarOuPrepararProfessores();
  const aba = obterPlanilhaEBD().getSheetByName(NOME_ABA_PROFESSORES);
  const dados = aba.getDataRange().getValues();
  const classes = {};
  CLASSES_ESCALA_EBD.forEach(function(classe){ classes[classe] = []; });
  const suporte = [];

  function adicionar(lista, nome, ativo) {
    const chave = String(nome || "").trim().toLowerCase();
    if (!chave) return;
    if (lista.some(function(item){ return item.nome.toLowerCase() === chave; })) return;
    lista.push({nome:String(nome).trim(), ativo:ativo});
  }

  for (let i=1; i<dados.length; i++) {
    const nome = String(dados[i][0] || "").trim();
    if (!nome) continue;
    const classe = normalizarNomeClasseEBD(dados[i][1]);
    const ativo = String(dados[i][2] || "Ativo").trim().toLowerCase() !== "inativo";
    const observacao = String(dados[i][4] || "").toLowerCase();
    if (classes[classe]) adicionar(classes[classe], nome, ativo);
    if (classe === COLUNA_SUPORTE_EBD || classe === "Superintendente" || observacao.indexOf("suporte") !== -1) adicionar(suporte, nome, ativo);
  }

  if (!suporte.length && infoEscala) {
    const indiceSuporte = infoEscala.cabecalhos.indexOf(COLUNA_SUPORTE_EBD);
    if (indiceSuporte >= 0) {
      infoEscala.linhas.forEach(function(item){
        separarNomesEscalaEBD(item.valores[indiceSuporte]).forEach(function(nome){ adicionar(suporte, nome, true); });
      });
    }
  }
  return {classes:classes, suporte:suporte};
}

function obterUltimoNomeColunaEBD(info, coluna, ordem) {
  const indice = coluna === COLUNA_SUPORTE_EBD ? info.cabecalhos.indexOf(COLUNA_SUPORTE_EBD) : encontrarIndiceClasseEscalaEBD(info.cabecalhos, coluna);
  if (indice < 0) return "";
  for (let i=info.linhas.length-1; i>=0; i--) {
    const nomes = separarNomesEscalaEBD(info.linhas[i].valores[indice]);
    for (let n=0; n<nomes.length; n++) {
      if (ordem.some(function(item){ return item.nome.toLowerCase() === nomes[n].toLowerCase(); })) return nomes[n];
    }
    if (nomes.length) return nomes[0];
  }
  return "";
}

function criarCicloAtivoEBD(ordem, ultimoNome) {
  const ativos = ordem.filter(function(item){ return item.ativo; });
  if (!ativos.length) return [];
  const indiceUltimo = ordem.findIndex(function(item){ return item.nome.toLowerCase() === String(ultimoNome || "").toLowerCase(); });
  const ciclo = [];
  for (let passo=1; passo<=ordem.length; passo++) {
    const indice = indiceUltimo >= 0 ? (indiceUltimo + passo) % ordem.length : passo - 1;
    if (ordem[indice].ativo) ciclo.push(ordem[indice].nome);
  }
  return ciclo.length ? ciclo : ativos.map(function(item){ return item.nome; });
}

function idArquivoEscalaEBD(periodo, data, classe) {
  return periodo.ano + "-" + periodo.trimestre + "T-" + Utilities.formatDate(normalizarDataEBD(data), TIMEZONE_EBD, "dd/MM/yyyy") + "-" + classe;
}

function obterIdsEsperadosArquivoEBD(info) {
  const ids = [];
  info.linhas.forEach(function(item){
    CLASSES_ESCALA_EBD.forEach(function(classe){ ids.push(idArquivoEscalaEBD(info.periodo, item.data, classe)); });
  });
  return ids;
}

function obterMapaIdsHistoricoEBD() {
  const aba = criarOuPrepararHistoricoEscalasEBD();
  const dados = aba.getDataRange().getValues();
  const mapa = {};
  for (let i=1; i<dados.length; i++) mapa[String(dados[i][0] || "")] = true;
  return mapa;
}

function arquivarEscalaInternoEBD(info, origem, observacao) {
  const historico = criarOuPrepararHistoricoEscalasEBD();
  const existentes = obterMapaIdsHistoricoEBD();
  const indiceSuporte = info.cabecalhos.indexOf(COLUNA_SUPORTE_EBD);
  const linhas = [];
  let duplicados = 0;
  info.linhas.forEach(function(item){
    const suporte = indiceSuporte >= 0 ? String(item.valores[indiceSuporte] || "").trim() : "";
    CLASSES_ESCALA_EBD.forEach(function(classe){
      const indiceClasse = encontrarIndiceClasseEscalaEBD(info.cabecalhos, classe);
      if (indiceClasse < 0) return;
      const id = idArquivoEscalaEBD(info.periodo, item.data, classe);
      if (existentes[id]) { duplicados++; return; }
      existentes[id] = true;
      linhas.push([
        id,
        info.periodo.ano,
        rotuloTrimestreEBD(info.periodo.trimestre),
        item.data,
        classe,
        String(item.valores[indiceClasse] || "").trim(),
        suporte,
        String(origem || "Automação trimestral"),
        agoraFormatadoEBD(),
        String(observacao || "Arquivamento do trimestre encerrado.")
      ]);
    });
  });
  if (linhas.length) {
    historico.getRange(historico.getLastRow()+1,1,linhas.length,10).setValues(linhas);
    historico.getRange(historico.getLastRow()-linhas.length+1,4,linhas.length,1).setNumberFormat("dd/MM/yyyy");
  }
  const estado = lerEstadoTrimestralEBD();
  estado.ultimoArquivamento = {
    ano:info.periodo.ano,
    trimestre:info.periodo.trimestre,
    rotulo:rotuloTrimestreEBD(info.periodo.trimestre),
    data:agoraFormatadoEBD(),
    inseridos:linhas.length,
    duplicados:duplicados,
    origem:String(origem || "Automação trimestral")
  };
  estado.pendentePreparacao = true;
  salvarEstadoTrimestralEBD(estado);
  SpreadsheetApp.flush();
  return {sucesso:true, inseridos:linhas.length, duplicados:duplicados, mensagem:"Escala arquivada com segurança.", periodo:info.periodo};
}

function arquivarEscalaAtual(parametros) {
  validarSenhaAdmin(parametros);
  const info = obterDadosEscalaTrimestralEBD();
  const anoInformado = Number(parametros.ano || 0);
  const trimestreInformado = Number((String(parametros.trimestre || "").match(/[1-4]/) || [0])[0]);
  if (anoInformado && anoInformado !== info.periodo.ano) throw new Error("O ano informado não corresponde às datas da escala atual.");
  if (trimestreInformado && trimestreInformado !== info.periodo.trimestre) throw new Error("O trimestre informado não corresponde às datas da escala atual.");
  return arquivarEscalaInternoEBD(info, parametros.origem || "Painel Admin - Arquivamento manual", parametros.observacao || "Arquivamento manual de segurança.");
}

function gatilhoTrimestralInstaladoEBD() {
  return ScriptApp.getProjectTriggers().some(function(gatilho){ return gatilho.getHandlerFunction() === FUNCAO_GATILHO_TRIMESTRAL_EBD; });
}

function instalarAutomacaoTrimestralEBD(parametros) {
  if (parametros) validarSenhaAdmin(parametros);
  const planilha = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(ID_PLANILHA_PADRAO_EBD);
  PropertiesService.getScriptProperties().setProperty(PROP_PLANILHA_ID_EBD, planilha.getId());
  ScriptApp.getProjectTriggers().forEach(function(gatilho){
    if (gatilho.getHandlerFunction() === FUNCAO_GATILHO_TRIMESTRAL_EBD) ScriptApp.deleteTrigger(gatilho);
  });
  ScriptApp.newTrigger(FUNCAO_GATILHO_TRIMESTRAL_EBD)
    .timeBased()
    .atHour(HORA_GATILHO_TRIMESTRAL_EBD)
    .nearMinute(15)
    .everyDays(1)
    .inTimezone(TIMEZONE_EBD)
    .create();
  const estado = lerEstadoTrimestralEBD();
  estado.automacaoInstaladaEm = agoraFormatadoEBD();
  salvarEstadoTrimestralEBD(estado);
  return {sucesso:true, instalado:true, mensagem:"Automação trimestral instalada. A verificação será executada diariamente."};
}

function verificarEncerramentoTrimestralInternoEBD(origem) {
  const info = obterDadosEscalaTrimestralEBD();
  const hoje = hojeEBD();
  const encerrado = hoje.getTime() > info.ultimaData.getTime();
  const estado = lerEstadoTrimestralEBD();
  estado.ultimaVerificacao = agoraFormatadoEBD();
  salvarEstadoTrimestralEBD(estado);
  if (!encerrado) {
    return {sucesso:true, encerrado:false, arquivado:false, mensagem:"O trimestre atual ainda está em andamento.", ultimaData:formatarValorEscalaEBD(info.ultimaData)};
  }
  const resultado = arquivarEscalaInternoEBD(info, origem || "Automação diária", "Arquivamento automático após a última data do trimestre.");
  resultado.encerrado = true;
  resultado.arquivado = true;
  return resultado;
}

function verificarEncerramentoTrimestralEBD() {
  return executarComLockEBD(function(){ return verificarEncerramentoTrimestralInternoEBD("Gatilho automático diário"); });
}

function verificarEncerramentoTrimestralAdminEBD(parametros) {
  validarSenhaAdmin(parametros);
  return verificarEncerramentoTrimestralInternoEBD("Painel Admin - Verificação manual");
}

function criarBackupEscalaEBD(info) {
  const planilha = info.planilha;
  const base = "BACKUP " + info.periodo.trimestre + "T " + info.periodo.ano + " " + Utilities.formatDate(new Date(), TIMEZONE_EBD, "yyyyMMdd-HHmm");
  let nome = base.substring(0, 95), contador = 2;
  while (planilha.getSheetByName(nome)) {
    nome = (base + "-" + contador).substring(0, 99);
    contador++;
  }
  const copia = info.aba.copyTo(planilha).setName(nome);
  copia.hideSheet();
  return nome;
}

function aplicarValidacoesEscalaEBD(aba, totalDatas, ordens) {
  const maxLinhas = aba.getMaxRows();
  const maxColunas = aba.getMaxColumns();
  if (maxLinhas > 1 && maxColunas > 1) aba.getRange(2,2,maxLinhas-1,maxColunas-1).clearDataValidations();
  CLASSES_ESCALA_EBD.forEach(function(classe, indice){
    const lista = (ordens.classes[classe] || []).filter(function(item){ return item.ativo; }).map(function(item){ return item.nome; });
    if (!lista.length || !totalDatas) return;
    const regra = SpreadsheetApp.newDataValidation().requireValueInList(lista, true).setAllowInvalid(false).build();
    aba.getRange(2, indice + 2, totalDatas, 1).setDataValidation(regra);
  });
  const suporte = (ordens.suporte || []).filter(function(item){ return item.ativo; }).map(function(item){ return item.nome; });
  if (suporte.length && totalDatas) {
    const regraSuporte = SpreadsheetApp.newDataValidation().requireValueInList(suporte, true).setAllowInvalid(false).build();
    aba.getRange(2, ORDEM_COLUNAS_ESCALA_EBD.length, totalDatas, 1).setDataValidation(regraSuporte);
  }
}

function formatarEscalaTrimestralEBD(aba, totalDatas) {
  const totalLinhas = totalDatas + 1;
  aba.setFrozenRows(1);
  aba.setFrozenColumns(1);
  aba.setHiddenGridlines(true);
  aba.setRowHeight(1, 48);
  if (totalDatas) aba.setRowHeights(2, totalDatas, 34);
  [105,160,160,160,170,170,170,170,125,135,105].forEach(function(largura, indice){ aba.setColumnWidth(indice + 1, largura); });
  const tabela = aba.getRange(1,1,totalLinhas,ORDEM_COLUNAS_ESCALA_EBD.length);
  tabela.setFontFamily("Arial").setFontSize(10).setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  aba.getRange(1,1,1,ORDEM_COLUNAS_ESCALA_EBD.length).setBackground("#1f4e79").setFontColor("#ffffff").setFontWeight("bold");
  if (totalDatas) {
    aba.getRange(2,1,totalDatas,1).setBackground("#d9eaf7").setFontColor("#082f49").setFontWeight("bold").setNumberFormat("dd/MM/yyyy");
    for (let linha=2; linha<=totalLinhas; linha++) {
      aba.getRange(linha,2,1,ORDEM_COLUNAS_ESCALA_EBD.length-1).setBackground(linha % 2 === 0 ? "#f6fbff" : "#ffffff");
    }
  }
  tabela.setBorder(true,true,true,true,true,true,"#cbd9e3",SpreadsheetApp.BorderStyle.SOLID);
  aba.getRange(1,1,totalLinhas,ORDEM_COLUNAS_ESCALA_EBD.length).setBorder(true,true,true,true,null,null,"#1f4e79",SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function colunaLetraEBD(numero) {
  let n = Number(numero), texto = "";
  while (n > 0) { const resto = (n - 1) % 26; texto = String.fromCharCode(65 + resto) + texto; n = Math.floor((n - 1) / 26); }
  return texto;
}

function reconstruirResumoEBD(abaEscala, totalDatas, ordens, periodo) {
  const planilha = obterPlanilhaEBD();
  let resumo = planilha.getSheetByName("Resumo");
  if (!resumo) resumo = planilha.insertSheet("Resumo");
  resumo.getDataRange().breakApart();
  resumo.clear();
  resumo.getRange("A1:C1").merge().setValue("Resumo da distribuição das aulas — " + rotuloTrimestreEBD(periodo.trimestre) + " de " + periodo.ano);
  resumo.getRange("A3:C3").setValues([["Classe","Professor","Quantidade"]]);
  const linhas = [];
  CLASSES_ESCALA_EBD.concat([COLUNA_SUPORTE_EBD]).forEach(function(classe){
    const ordem = classe === COLUNA_SUPORTE_EBD ? ordens.suporte : ordens.classes[classe] || [];
    ordem.filter(function(item){ return item.ativo; }).forEach(function(item){ linhas.push([classe,item.nome,""]); });
  });
  if (linhas.length) resumo.getRange(4,1,linhas.length,3).setValues(linhas);
  for (let i=0; i<linhas.length; i++) {
    const linhaResumo = i + 4;
    const classe = linhas[i][0];
    const indiceColuna = classe === COLUNA_SUPORTE_EBD ? ORDEM_COLUNAS_ESCALA_EBD.length : CLASSES_ESCALA_EBD.indexOf(classe) + 2;
    const letra = colunaLetraEBD(indiceColuna);
    resumo.getRange(linhaResumo,3).setFormula("=COUNTIF('Escala EBD'!" + letra + "2:" + letra + (totalDatas + 1) + ",B" + linhaResumo + ")");
  }
  resumo.getRange("A1:C1").setBackground("#1f4e79").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  resumo.getRange("A3:C3").setBackground("#d9eaf7").setFontWeight("bold").setHorizontalAlignment("center");
  if (linhas.length) resumo.getRange(4,1,linhas.length,3).setBorder(true,true,true,true,true,true,"#cbd9e3",SpreadsheetApp.BorderStyle.SOLID).setVerticalAlignment("middle");
  resumo.setFrozenRows(3);
  resumo.setColumnWidth(1,220); resumo.setColumnWidth(2,200); resumo.setColumnWidth(3,110);
}

function prepararProximoTrimestreEBD(parametros) {
  validarSenhaAdmin(parametros);
  const confirmacao = String(parametros.confirmacao || "").trim();
  if (confirmacao !== "PREPARAR") throw new Error("Confirmação administrativa inválida.");
  const info = obterDadosEscalaTrimestralEBD();
  const hoje = hojeEBD();
  if (hoje.getTime() <= info.ultimaData.getTime()) throw new Error("O trimestre atual ainda não terminou. A nova escala só pode ser preparada após a última data.");

  const idsEsperados = obterIdsEsperadosArquivoEBD(info);
  const existentes = obterMapaIdsHistoricoEBD();
  const faltantes = idsEsperados.filter(function(id){ return !existentes[id]; });
  if (faltantes.length) throw new Error("O arquivamento ainda não está completo. Use 'Verificar e arquivar agora' antes de preparar o próximo trimestre.");

  const ordens = obterOrdemProfessoresEBD(info);
  const proximo = proximoPeriodoEBD(info.periodo);
  const domingos = obterDomingosTrimestreEBD(proximo.ano, proximo.trimestre);
  if (!domingos.length) throw new Error("Nenhum domingo foi encontrado para o próximo trimestre.");
  const backup = criarBackupEscalaEBD(info);
  const linhas = [];
  const ciclos = {};
  CLASSES_ESCALA_EBD.forEach(function(classe){
    ciclos[classe] = criarCicloAtivoEBD(ordens.classes[classe] || [], obterUltimoNomeColunaEBD(info, classe, ordens.classes[classe] || []));
  });
  const cicloSuporte = criarCicloAtivoEBD(ordens.suporte || [], obterUltimoNomeColunaEBD(info, COLUNA_SUPORTE_EBD, ordens.suporte || []));

  domingos.forEach(function(data, indice){
    const linha = [data];
    CLASSES_ESCALA_EBD.forEach(function(classe){
      const ciclo = ciclos[classe] || [];
      linha.push(ciclo.length ? ciclo[indice % ciclo.length] : "");
    });
    linha.push(cicloSuporte.length ? cicloSuporte[indice % cicloSuporte.length] : "");
    linhas.push(linha);
  });

  const aba = info.aba;
  const linhasParaLimpar = Math.max(aba.getMaxRows() - 1, 1);
  aba.getRange(2,1,linhasParaLimpar,aba.getMaxColumns()).clearContent().clearDataValidations().clearFormat();
  aba.getRange(1,1,1,ORDEM_COLUNAS_ESCALA_EBD.length).setValues([ORDEM_COLUNAS_ESCALA_EBD]);
  aba.getRange(2,1,linhas.length,ORDEM_COLUNAS_ESCALA_EBD.length).setValues(linhas);
  aplicarValidacoesEscalaEBD(aba, linhas.length, ordens);
  formatarEscalaTrimestralEBD(aba, linhas.length);
  reconstruirResumoEBD(aba, linhas.length, ordens, proximo);

  const estado = lerEstadoTrimestralEBD();
  estado.pendentePreparacao = false;
  estado.ultimaPreparacao = {ano:proximo.ano, trimestre:proximo.trimestre, data:agoraFormatadoEBD(), backup:backup};
  salvarEstadoTrimestralEBD(estado);
  registrarHistorico({
    dataHora:new Date(), classe:"Escala", professorSolicitante:"Administrador",
    dataAntiga:rotuloTrimestreEBD(info.periodo.trimestre) + " de " + info.periodo.ano,
    novaData:rotuloTrimestreEBD(proximo.trimestre) + " de " + proximo.ano,
    professorTrocado:"Preparou automaticamente " + linhas.length + " domingos, mantendo a sequência dos professores. Backup: " + backup,
    origem:"Painel Admin - Preparação trimestral"
  });
  SpreadsheetApp.flush();
  return {sucesso:true, mensagem:"Próximo trimestre preparado com sucesso.", ano:proximo.ano, trimestre:proximo.trimestre, rotulo:rotuloTrimestreEBD(proximo.trimestre), domingos:linhas.length, backup:backup};
}

function obterStatusTrimestralEBD() {
  const info = obterDadosEscalaTrimestralEBD();
  const idsEsperados = obterIdsEsperadosArquivoEBD(info);
  const existentes = obterMapaIdsHistoricoEBD();
  const arquivados = idsEsperados.filter(function(id){ return existentes[id]; }).length;
  const encerrado = hojeEBD().getTime() > info.ultimaData.getTime();
  const proximo = proximoPeriodoEBD(info.periodo);
  const estado = lerEstadoTrimestralEBD();
  return {
    sucesso:true,
    automacaoInstalada:gatilhoTrimestralInstaladoEBD(),
    horaAutomacao:HORA_GATILHO_TRIMESTRAL_EBD + ":15",
    periodoAtual:{ano:info.periodo.ano, trimestre:info.periodo.trimestre, rotulo:rotuloTrimestreEBD(info.periodo.trimestre)},
    primeiraData:formatarValorEscalaEBD(info.primeiraData),
    ultimaData:formatarValorEscalaEBD(info.ultimaData),
    totalDomingos:info.linhas.length,
    encerrado:encerrado,
    arquivamentoCompleto:arquivados === idsEsperados.length,
    registrosArquivados:arquivados,
    registrosEsperados:idsEsperados.length,
    podePreparar:encerrado && arquivados === idsEsperados.length,
    proximoPeriodo:{ano:proximo.ano, trimestre:proximo.trimestre, rotulo:rotuloTrimestreEBD(proximo.trimestre)},
    ultimaVerificacao:estado.ultimaVerificacao || "",
    ultimoArquivamento:estado.ultimoArquivamento || null,
    ultimaPreparacao:estado.ultimaPreparacao || null
  };
}

function consultarHistoricoEscalas(parametros) {
  const aba = criarOuPrepararHistoricoEscalasEBD();
  const dados = aba.getDataRange().getValues();
  const headers = dados[0].map(function(v){return String(v || "").trim();});
  const limite = Math.min(Number(parametros.limite || 1000) || 1000,5000), registros=[];
  for (let i=dados.length-1; i>=1 && registros.length<limite; i--) {
    const item={}; headers.forEach(function(h,c){item[h]=formatarValorEscalaEBD(dados[i][c]);});
    if (parametros.ano && String(item.Ano)!==String(parametros.ano)) continue;
    if (parametros.trimestre && String(item.Trimestre)!==String(parametros.trimestre)) continue;
    if (parametros.classe && String(item.Classe)!==String(parametros.classe)) continue;
    if (parametros.professor && String(item.Professor).toLowerCase().indexOf(String(parametros.professor).toLowerCase())===-1) continue;
    registros.push(item);
  }
  return {sucesso:true,registros:registros};
}

function obterLicaoPadraoAdultos() {
  return `
    <h3>Classe de Jovens e Adultos 👔🌸🔥</h3>

    <h4>Lição modelo da semana</h4>

    <p>
      <strong>Tema:</strong> Sede firmes e constantes na obra do Senhor.
    </p>

    <blockquote>
      “Portanto, meus amados irmãos, sede firmes e constantes, sempre abundantes na obra do Senhor,
      sabendo que o vosso trabalho não é vão no Senhor.”
      <br>
      <strong>1 Coríntios 15:58</strong>
    </blockquote>

    <h4>Verdade prática</h4>
    <p>
      Jovens e adultos são chamados a servir ao Senhor com perseverança, maturidade e fidelidade,
      sabendo que Deus valoriza cada esforço realizado em sua obra.
    </p>
  `;
}

function obterLicaoPadraoJovens() {
  return `
    <h3>Classe de Adolescentes 🌱</h3>

    <h4>Lição modelo da semana</h4>

    <p>
      <strong>Tema:</strong> Adolescentes firmes em Cristo em uma geração instável.
    </p>

    <blockquote>
      “Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis, na palavra,
      no trato, no amor, no espírito, na fé, na pureza.”
      <br>
      <strong>1 Timóteo 4:12</strong>
    </blockquote>

    <h4>Verdade prática</h4>
    <p>
      O adolescente cristão pode ser exemplo em sua geração quando decide viver com fé,
      pureza, responsabilidade e compromisso com Deus.
    </p>
  `;
}

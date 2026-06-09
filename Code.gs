const NOME_ABA_ESCALA = "Escala EBD";
const NOME_ABA_HISTORICO = "Histórico";
const NOME_ABA_LICOES = "Licoes";
const NOME_ABA_PROFESSORES = "Professores";
const NOME_ABA_QUIZZES = "Quizzes";

/*
  Altere esta senha para a senha que você deseja usar no painel admin.html.
  Exemplo:
  const SENHA_ADMIN = "ebd2026";
*/
const SENHA_ADMIN = "ebd2026";

const CLASSES_ESCALA_EBD = [
  "Cordeirinhos de Cristo",
  "Soldadinhos de Cristo",
  "Heróis e Amigos",
  "Vencedores por Cristo",
  "Vivendo em Cristo",
  "Testemunhas de Cristo",
  "Sara",
  "Heróis da Fé"
];

const COLUNA_SUPORTE_EBD = "Suporte";

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

const ORDEM_COLUNAS_ESCALA_EBD = ["Data"]
  .concat(CLASSES_ESCALA_EBD)
  .concat([COLUNA_SUPORTE_EBD]);

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
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "dd/MM/yyyy");
  }

  return valor === undefined || valor === null ? "" : String(valor).trim();
}


function doGet(e) {
  const parametros = e.parameter || {};
  const acao = parametros.acao || "";
  const callback = parametros.callback || "";

  let resposta;

  try {
    if (acao === "listar") {
      resposta = listarEscala();

    } else if (acao === "trocar") {
      resposta = trocarProfessor(parametros);

    } else if (acao === "historico") {
      resposta = listarHistorico(parametros);

    } else if (acao === "versao") {
      resposta = obterVersaoEscala();

    } else if (acao === "licoes") {
      resposta = listarLicoes();

    } else if (acao === "salvarLicoes") {
      resposta = salvarLicoes(parametros);

    } else if (acao === "preparar") {
      resposta = prepararPlanilhaEscalaEBD();

    } else if (acao === "adminSalvarProfessor") {
      resposta = adminSalvarProfessor(parametros);

    } else if (acao === "adminAdicionarData") {
      resposta = adminAdicionarData(parametros);

    } else if (acao === "adminRemoverData") {
      resposta = adminRemoverData(parametros);

    } else if (acao === "adminRenomearClasse") {
      resposta = adminRenomearClasse(parametros);

    } else if (acao === "quizzes") {
      resposta = listarQuizzes();

    } else if (acao === "salvarQuizzes") {
      resposta = salvarQuizzes(parametros);

    } else if (acao === "listarProfessores") {
      resposta = listarProfessores();

    } else if (acao === "adicionarProfessor") {
      resposta = adicionarProfessor(parametros);

    } else if (acao === "atualizarProfessor") {
      resposta = atualizarProfessor(parametros);

    } else if (acao === "inativarProfessor") {
      resposta = inativarProfessor(parametros);

    } else if (acao === "substituirProfessor") {
      resposta = substituirProfessor(parametros);

    } else if (acao === "mudarProfessorClasse") {
      resposta = mudarProfessorClasse(parametros);

    } else {
      resposta = {
        sucesso: false,
        mensagem: "Ação inválida."
      };
    }

  } catch (erro) {
    resposta = {
      sucesso: false,
      mensagem: erro.message || "Erro inesperado no Apps Script."
    };
  }

  return responderSaida(resposta, callback);
}

function doPost(e) {
  let resposta;

  try {
    const parametros = e && e.parameter ? e.parameter : {};
    const acao = parametros.acao || "";

    if (acao === "salvarLicoes") {
      resposta = salvarLicoes(parametros);
    } else {
      resposta = {
        sucesso: false,
        mensagem: "Ação POST inválida ou não informada."
      };
    }

  } catch (erro) {
    resposta = {
      sucesso: false,
      mensagem: erro.message || "Erro inesperado ao salvar."
    };
  }

  return responderHtmlParaAdmin(resposta);
}

function responderSaida(resposta, callback) {
  const conteudo = JSON.stringify(resposta);

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + conteudo + ");")
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

function validarSenhaAdmin(parametros) {
  const senha = parametros.senha || "";

  if (senha !== SENHA_ADMIN) {
    throw new Error("Senha administrativa incorreta.");
  }
}

function prepararPlanilhaEscalaEBD() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_ESCALA);
  }

  aba.clear();

  const cabecalhos = ORDEM_COLUNAS_ESCALA_EBD.slice();

  const dados = [
    ["17/05/2026", "Rosilene", "Rita", "Oseas Junior", "Maria Tereza", "Noeme", "Emanuela", "Pastora", "Pb Elias", "Ronan"],
    ["24/05/2026", "Alessandra", "Thaís", "Igor", "Fernanda", "Suely", "Lucas", "Samella", "Pb Felipe", "Ronan"],
    ["31/05/2026", "Edivania", "Vitória", "Oseas Junior", "Graziele", "Noeme", "Ronan", "Ana Cardoso", "Pb Claudinei", "Ronan"],
    ["07/06/2026", "Rosângela", "Larissa", "Igor", "Maria Tereza", "Suely", "Emanuela", "Pastora", "Pb Adriano", "Ronan"],
    ["14/06/2026", "Rosilene", "Rita", "Oseas Junior", "Fernanda", "Noeme", "Lucas", "Samella", "Dc João Paulo", "Ronan"],
    ["21/06/2026", "Alessandra", "Thaís", "Igor", "Graziele", "Suely", "Ronan", "Ana Cardoso", "Pb Elias", "Ronan"],
    ["28/06/2026", "Edivania", "Vitória", "Oseas Junior", "Maria Tereza", "Noeme", "Emanuela", "Pastora", "Pb Felipe", "Ronan"]
  ];

  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  aba.getRange(2, 1, dados.length, cabecalhos.length).setValues(dados);

  const intervaloCabecalho = aba.getRange(1, 1, 1, cabecalhos.length);

  intervaloCabecalho
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1f4e79")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  const intervaloDados = aba.getRange(2, 1, dados.length, cabecalhos.length);

  intervaloDados
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);

  aba.setFrozenRows(1);
  aba.autoResizeColumns(1, cabecalhos.length);
  aba.getRange("A:A").setNumberFormat("@");

  aba.getRange(1, 1, dados.length + 1, cabecalhos.length).setBorder(
    true,
    true,
    true,
    true,
    true,
    true
  );

  criarOuPrepararHistorico();
  criarOuPrepararLicoes();
  criarOuPrepararProfessores();
  criarOuPrepararQuizzes();

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Planilha Escala EBD preparada com sucesso."
  };
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

function criarOuPrepararLicoes() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_LICOES);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_LICOES);
  }

  const cabecalhos = [
    "Classe",
    "ConteudoHTML",
    "AtualizadoEm"
  ];

  if (aba.getLastRow() === 0) {
    aba.appendRow(cabecalhos);

    aba.appendRow([
      "adultos",
      obterLicaoPadraoAdultos(),
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")
    ]);

    aba.appendRow([
      "jovens",
      obterLicaoPadraoJovens(),
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")
    ]);
  }

  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  aba.getRange(1, 1, 1, cabecalhos.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1f4e79")
    .setHorizontalAlignment("center");

  aba.setFrozenRows(1);
  aba.setColumnWidths(1, 1, 130);
  aba.setColumnWidths(2, 1, 700);
  aba.setColumnWidths(3, 1, 180);

  const ultimaLinha = Math.max(aba.getLastRow(), 2);

  aba.getRange(1, 1, ultimaLinha, cabecalhos.length)
    .setVerticalAlignment("top")
    .setWrap(true);

  garantirLinhaLicao("adultos", obterLicaoPadraoAdultos());
  garantirLinhaLicao("jovens", obterLicaoPadraoJovens());
}

function garantirLinhaLicao(classe, conteudoPadrao) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_LICOES);

  if (!aba) {
    return;
  }

  const dados = aba.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    const classeLinha = String(dados[i][0] || "").trim().toLowerCase();

    if (classeLinha === classe) {
      return;
    }
  }

  aba.appendRow([
    classe,
    conteudoPadrao,
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")
  ]);
}

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
      dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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
      dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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
      dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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
      dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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
    Utilities.formatDate(dados.dataHora, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"),
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

function listarLicoes() {
  criarOuPrepararLicoes();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_LICOES);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_LICOES + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();

  const licoes = {
    adultos: obterLicaoPadraoAdultos(),
    jovens: obterLicaoPadraoJovens()
  };

  let atualizadoEm = "";

  for (let i = 1; i < dados.length; i++) {
    const classe = String(dados[i][0] || "").trim().toLowerCase();
    const conteudo = String(dados[i][1] || "");
    const dataAtualizacao = String(dados[i][2] || "");

    if (classe === "adultos") {
      licoes.adultos = conteudo || obterLicaoPadraoAdultos();
      atualizadoEm = dataAtualizacao || atualizadoEm;
    }

    if (classe === "jovens") {
      licoes.jovens = conteudo || obterLicaoPadraoJovens();
      atualizadoEm = dataAtualizacao || atualizadoEm;
    }
  }

  return {
    sucesso: true,
    licoes: licoes,
    atualizadoEm: atualizadoEm
  };
}

function salvarLicoes(parametros) {
  validarSenhaAdmin(parametros);

  const adultos = parametros.adultos || "";
  const jovens = parametros.jovens || "";

  if (!adultos && !jovens) {
    throw new Error("Nenhuma lição foi recebida para salvar.");
  }

  criarOuPrepararLicoes();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_LICOES);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_LICOES + "' não foi encontrada.");
  }

  if (adultos) {
    salvarLicaoNaAba(aba, "adultos", adultos);
  }

  if (jovens) {
    salvarLicaoNaAba(aba, "jovens", jovens);
  }

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Lições salvas com sucesso na aba Licoes.",
    atualizadoEm: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")
  };
}

function salvarLicaoNaAba(aba, classe, conteudo) {
  const dados = aba.getDataRange().getValues();
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  for (let i = 1; i < dados.length; i++) {
    const classeLinha = String(dados[i][0] || "").trim().toLowerCase();

    if (classeLinha === classe) {
      aba.getRange(i + 1, 2).setValue(conteudo);
      aba.getRange(i + 1, 3).setValue(agora);
      return;
    }
  }

  aba.appendRow([
    classe,
    conteudo,
    agora
  ]);
}



function criarOuPrepararQuizzes() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName(NOME_ABA_QUIZZES);

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_QUIZZES);
  }

  const cabecalhos = ["Classe", "Link", "AtualizadoEm"];

  if (aba.getLastRow() === 0) {
    const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

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
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

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

  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_PROFESSORES);
  }

  const cabecalhos = [
    "Nome",
    "Classe",
    "Status",
    "Observacao",
    "AtualizadoEm"
  ];

  if (aba.getLastRow() === 0) {
    aba.appendRow(cabecalhos);
    popularProfessoresDaEscala(aba);
  }

  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);

  aba.getRange(1, 1, 1, cabecalhos.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1f4e79")
    .setHorizontalAlignment("center");

  aba.setFrozenRows(1);
  aba.setColumnWidths(1, 1, 220);
  aba.setColumnWidths(2, 1, 180);
  aba.setColumnWidths(3, 1, 110);
  aba.setColumnWidths(4, 1, 320);
  aba.setColumnWidths(5, 1, 180);

  const ultimaLinha = Math.max(aba.getLastRow(), 2);
  aba.getRange(1, 1, ultimaLinha, cabecalhos.length)
    .setVerticalAlignment("top")
    .setWrap(true);
}

function popularProfessoresDaEscala(abaProfessores) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaEscala = planilha.getSheetByName(NOME_ABA_ESCALA);

  if (!abaEscala) {
    return;
  }

  const dados = abaEscala.getDataRange().getValues();

  if (dados.length < 2) {
    return;
  }

  const cabecalhos = dados[0].map(function (item) {
    return String(item).trim();
  });

  const vistos = {};
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  for (let col = 1; col < cabecalhos.length; col++) {
    const classe = normalizarNomeClasseEBD(cabecalhos[col]);

    if (!ehColunaClasseEBD(classe)) {
      continue;
    }

    for (let lin = 1; lin < dados.length; lin++) {
      const valor = String(dados[lin][col] || "").trim();

      if (!valor) {
        continue;
      }

      const nomes = valor.split("/").map(function (nome) {
        return nome.trim();
      }).filter(Boolean);

      nomes.forEach(function (nome) {
        const chave = nome.toLowerCase();

        if (vistos[chave]) {
          return;
        }

        vistos[chave] = true;
        abaProfessores.appendRow([nome, classe, "Ativo", "Importado da escala atual", agora]);
      });
    }
  }
}

function listarProfessores() {
  criarOuPrepararProfessores();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);

  if (!aba) {
    throw new Error("A aba '" + NOME_ABA_PROFESSORES + "' não foi encontrada.");
  }

  const dados = aba.getDataRange().getValues();
  const professores = [];

  for (let i = 1; i < dados.length; i++) {
    const nome = String(dados[i][0] || "").trim();

    if (!nome) {
      continue;
    }

    professores.push({
      nome: nome,
      classe: String(dados[i][1] || "").trim(),
      status: String(dados[i][2] || "Ativo").trim(),
      observacao: String(dados[i][3] || "").trim(),
      atualizadoEm: String(dados[i][4] || "").trim()
    });
  }

  professores.sort(function (a, b) {
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return {
    sucesso: true,
    professores: professores
  };
}

function encontrarLinhaProfessor(aba, nome) {
  const dados = aba.getDataRange().getValues();
  const nomeBusca = String(nome || "").trim().toLowerCase();

  for (let i = 1; i < dados.length; i++) {
    const nomeLinha = String(dados[i][0] || "").trim().toLowerCase();

    if (nomeLinha === nomeBusca) {
      return i + 1;
    }
  }

  return -1;
}

function adicionarProfessor(parametros) {
  validarSenhaAdmin(parametros);
  criarOuPrepararProfessores();

  const nome = String(parametros.nome || "").trim();
  const classe = String(parametros.classe || "").trim();
  const status = String(parametros.status || "Ativo").trim() || "Ativo";
  const observacao = String(parametros.observacao || "").trim();

  if (!nome) {
    throw new Error("Informe o nome do professor.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const linhaExistente = encontrarLinhaProfessor(aba, nome);
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  if (linhaExistente > -1) {
    throw new Error("Este professor já está cadastrado: " + nome);
  }

  aba.appendRow([nome, classe, status, observacao, agora]);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Professores",
    professorSolicitante: "Administrador",
    dataAntiga: "",
    novaData: "",
    professorTrocado: "Adicionou professor: " + nome + (classe ? " | Classe: " + classe : ""),
    origem: "Painel Admin - Professores"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Professor cadastrado com sucesso."
  };
}

function atualizarProfessor(parametros) {
  validarSenhaAdmin(parametros);
  criarOuPrepararProfessores();

  const nomeOriginal = String(parametros.nomeOriginal || "").trim();
  const nome = String(parametros.nome || "").trim();
  const classe = String(parametros.classe || "").trim();
  const status = String(parametros.status || "Ativo").trim() || "Ativo";
  const observacao = String(parametros.observacao || "").trim();

  if (!nomeOriginal || !nome) {
    throw new Error("Informe o professor para atualizar.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const linha = encontrarLinhaProfessor(aba, nomeOriginal);

  if (linha === -1) {
    throw new Error("Professor não encontrado: " + nomeOriginal);
  }

  if (nomeOriginal.toLowerCase() !== nome.toLowerCase()) {
    const linhaNomeNovo = encontrarLinhaProfessor(aba, nome);
    if (linhaNomeNovo > -1) {
      throw new Error("Já existe outro professor com o nome: " + nome);
    }
  }

  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  aba.getRange(linha, 1).setValue(nome);
  aba.getRange(linha, 2).setValue(classe);
  aba.getRange(linha, 3).setValue(status);
  aba.getRange(linha, 4).setValue(observacao);
  aba.getRange(linha, 5).setValue(agora);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Professores",
    professorSolicitante: "Administrador",
    dataAntiga: nomeOriginal,
    novaData: nome,
    professorTrocado: "Atualizou cadastro: " + nome + " | Classe: " + classe + " | Status: " + status,
    origem: "Painel Admin - Professores"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Cadastro do professor atualizado com sucesso."
  };
}

function inativarProfessor(parametros) {
  validarSenhaAdmin(parametros);
  criarOuPrepararProfessores();

  const nome = String(parametros.nome || "").trim();
  const observacao = String(parametros.observacao || "Professor inativado pelo administrador.").trim();

  if (!nome) {
    throw new Error("Informe o professor para inativar.");
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const linha = encontrarLinhaProfessor(aba, nome);

  if (linha === -1) {
    throw new Error("Professor não encontrado: " + nome);
  }

  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  aba.getRange(linha, 3).setValue("Inativo");
  aba.getRange(linha, 4).setValue(observacao);
  aba.getRange(linha, 5).setValue(agora);

  registrarHistorico({
    dataHora: new Date(),
    classe: "Professores",
    professorSolicitante: "Administrador",
    dataAntiga: "Ativo",
    novaData: "Inativo",
    professorTrocado: "Inativou professor: " + nome,
    origem: "Painel Admin - Professores"
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    mensagem: "Professor inativado com sucesso."
  };
}

function garantirProfessorAtivo(nome, classe, observacao) {
  if (!nome) {
    return;
  }

  criarOuPrepararProfessores();

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_PROFESSORES);
  const linha = encontrarLinhaProfessor(aba, nome);
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  if (linha === -1) {
    aba.appendRow([nome, classe || "", "Ativo", observacao || "Criado automaticamente pelo painel", agora]);
    return;
  }

  aba.getRange(linha, 3).setValue("Ativo");
  aba.getRange(linha, 5).setValue(agora);

  if (classe) {
    aba.getRange(linha, 2).setValue(classe);
  }
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
      dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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
    inativarProfessor({
      senha: SENHA_ADMIN,
      nome: professorAntigo,
      observacao: "Substituído por " + professorNovo
    });
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
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  if (linhaProfessor === -1) {
    abaProfessores.appendRow([professor, classeNova, "Ativo", "Criado ao mudar professor de classe", agora]);
  } else {
    abaProfessores.getRange(linhaProfessor, 2).setValue(classeNova);
    abaProfessores.getRange(linhaProfessor, 3).setValue("Ativo");
    abaProfessores.getRange(linhaProfessor, 5).setValue(agora);
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
        dataLinha = Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy");
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

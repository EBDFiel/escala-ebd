# Escala EBD

Versão 3.2 — confirmação segura do salvamento das lições — 15/07/2026.

## Correção 3.2

- reconhece corretamente as respostas do Apps Script hospedadas em subdomínios `googleusercontent.com`;
- associa cada salvamento a um identificador único;
- aceita a confirmação somente quando ela vier do iframe usado pelo formulário e corresponder ao salvamento em andamento;
- realiza até cinco conferências alternativas antes de apresentar erro;
- o backend também repete a leitura do Google Drive antes de concluir ou restaurar a versão anterior;
- remove a orientação indevida de repetir a migração quando os arquivos já estão configurados.

A correção preserva a escala, o histórico, a automação trimestral e os dois arquivos atuais das lições no Google Drive.

## Arquivos principais

- `Code.gs`: backend do Google Apps Script;
- `admin.html`: painel administrativo;
- `DOCUMENTACAO_ESCALA_EBD.md`: funcionamento técnico;
- `PASSO_A_PASSO_PUBLICACAO.md`: instalação do corretivo;
- `mapa-site.html`: mapa técnico atualizado.

O site continua publicado pelo GitHub Pages. O `Code.gs` precisa ser copiado para o projeto Apps Script vinculado à planilha e implantado como nova versão.

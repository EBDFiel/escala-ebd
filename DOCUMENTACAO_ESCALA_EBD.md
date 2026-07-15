# Escala EBD — Documentação completa

## Versão

Versão 3.2 — confirmação segura do salvamento das lições — 15/07/2026.

## Correção 3.2

O salvamento das lições é enviado por formulário para um iframe oculto. O Google pode servir a página de resposta por diferentes subdomínios de `googleusercontent.com`. A validação anterior aceitava somente dois endereços exatos e, por isso, algumas respostas legítimas eram ignoradas.

A versão 3.2 corrige o fluxo com quatro mecanismos:

1. cada salvamento recebe um `requisicaoId` exclusivo;
2. o backend devolve esse mesmo identificador na resposta;
3. o painel aceita a mensagem somente quando a origem é do Apps Script, a janela remetente é o iframe do formulário e o identificador corresponde à operação ativa;
4. se a resposta automática demorar, o painel consulta os arquivos até cinco vezes antes de concluir.

O backend também lê novamente os arquivos do Drive em até cinco tentativas. Se a conferência real não ocorrer, tenta restaurar o conteúdo anterior.

## Arquitetura

- **GitHub Pages:** página pública, painel e mapa do site;
- **Google Apps Script:** API, autenticação, escala, histórico, automação trimestral e lições;
- **Google Planilhas:** escala, professores, histórico, quizzes e metadados;
- **Google Drive:** `licao-adultos.html` e `licao-jovens.html`, contendo somente as versões atuais.

## Salvamento semanal das lições

1. O administrador atualiza uma ou as duas lições.
2. O painel sincroniza o editor visual com o HTML.
3. O HTML é sanitizado no cliente e novamente no backend.
4. O Apps Script substitui os arquivos atuais no Google Drive.
5. O backend relê os arquivos e compara os hashes.
6. A resposta retorna o identificador da operação.
7. O painel valida origem, janela remetente e identificador.
8. Se a resposta automática demorar, o painel executa conferências adicionais.
9. A aba `Licoes` recebe somente os metadados atuais.

A versão anterior da lição não é mantida como histórico semanal.

## Mensagens do painel

- **Lições atuais substituídas e conferidas:** confirmação automática recebida.
- **Confirmação automática demorou, mas os arquivos foram conferidos:** salvamento confirmado pela consulta alternativa.
- **Arquivos ainda não preparados:** somente nesse caso usar **Preparar / reparar Google Drive**.
- **Não foi possível confirmar após várias tentativas:** conferir a página pública antes de tentar novamente.

Não é necessário executar `migrarLicoesParaDriveEBD` depois que a pasta e os dois arquivos já foram criados.

## Escala e automação trimestral

A versão 3.2 preserva as funções restauradas na 3.1:

- escala semanal;
- troca de professores e apoio do Ronan;
- histórico;
- administração de datas, classes e professores;
- arquivamento trimestral;
- geração do trimestre seguinte;
- continuidade da sequência por classe;
- exclusão de professores inativos da sequência;
- backup oculto antes da preparação.

## Recuperação

Para a escala, abra uma aba oculta iniciada por `BACKUP_ESCALA_` e copie os dados necessários. Para as lições, o sistema tenta restaurar automaticamente o conteúdo anterior quando a conferência do salvamento falha durante a mesma operação.

## Operação de emergência

- Conferir escala: `/exec?acao=listar`.
- Conferir lições: `/exec?acao=licoes`.
- Reparar armazenamento das lições: botão **Preparar / reparar Google Drive**.
- Reparar gatilho trimestral: **Instalar / reparar automação**.
- Verificação imediata do trimestre: **Verificar e arquivar agora**.

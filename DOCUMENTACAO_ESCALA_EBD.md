# Escala EBD — Documentação completa

## Versão

Versão 3 — armazenamento das lições atuais no Google Drive, automação trimestral e continuidade da sequência — 14/07/2026.

## Arquitetura

- **GitHub Pages:** `index.html`, `admin.html`, recursos visuais, PWA e mapa do site.
- **Google Apps Script:** API, autenticação, escala, histórico, automação trimestral e gerenciamento das lições.
- **Google Planilhas:** escala, professores, histórico, quizzes e metadados das lições.
- **Google Drive:** dois arquivos HTML privados contendo somente as lições atuais.

## Armazenamento das lições

O sistema mantém somente:

- `licao-adultos.html`;
- `licao-jovens.html`.

Quando uma nova lição é salva, o conteúdo do arquivo correspondente é substituído. A versão anterior não é arquivada. Isso corresponde ao fluxo semanal da EBD e evita o limite de tamanho das células da planilha.

A pasta criada automaticamente recebe o nome `Escala EBD - Licoes Atuais`. Os arquivos permanecem privados no Drive do proprietário do Apps Script. A página pública não acessa o Drive diretamente; ela recebe o conteúdo por meio da ação `licoes` do Aplicativo da Web.

## Aba Licoes

Depois da migração, a aba `Licoes` não armazena mais o HTML. Ela contém apenas:

- classe;
- ID do arquivo no Drive;
- nome do arquivo;
- data e hora da atualização;
- tamanho em bytes;
- hash de conferência;
- tipo de armazenamento;
- URL privada do arquivo.

## Migração inicial

Depois de substituir o `Code.gs`, execute uma vez no editor do Apps Script:

```text
migrarLicoesParaDriveEBD
```

A função solicita a autorização do Google Drive, cria a pasta e os dois arquivos, migra as lições que ainda estiverem na planilha, confere o conteúdo e somente então transforma a aba `Licoes` em uma tabela de metadados.

Se a migração falhar antes da conferência, o HTML antigo permanece na planilha.

## Salvamento semanal

1. Entre no painel administrativo.
2. Abra **Lições interativas**.
3. Atualize Adultos e/ou Adolescentes.
4. Clique em **Substituir lições atuais**.
5. O Apps Script sanitiza o HTML.
6. Os arquivos atuais são substituídos no Drive.
7. O sistema lê novamente os arquivos e compara seus hashes.
8. A mensagem de sucesso só é exibida após a conferência.
9. A aba `Licoes` recebe os novos metadados.
10. A página pública busca a nova versão diretamente pelo Apps Script.

Se ocorrer falha durante uma atualização conjunta, o sistema tenta restaurar o conteúdo anterior dos arquivos já alterados.

## Segurança

- Operações administrativas exigem token temporário.
- Escritas utilizam `LockService`.
- Scripts, eventos HTML e elementos de incorporação perigosos são removidos do conteúdo das lições.
- Os arquivos no Drive não precisam ser compartilhados publicamente.
- O site público recebe somente o conteúdo sanitizado retornado pelo Apps Script.

## Automação trimestral

O gatilho diário verifica a última data da aba `Escala EBD`. Após o encerramento:

1. identifica o trimestre e o ano;
2. calcula os registros esperados;
3. arquiva somente os registros ausentes em `Historico_Escalas`;
4. impede duplicidade por identificador;
5. grava o estado do arquivamento;
6. libera a preparação do período seguinte no painel.

A escala atual não é substituída automaticamente.

## Preparação do trimestre seguinte

Depois do arquivamento validado, o administrador confirma a preparação. O sistema:

- cria um backup oculto da escala atual;
- calcula todos os domingos do próximo trimestre;
- preserva as classes;
- continua a sequência de professores;
- ignora professores inativos;
- reaplica as listas suspensas;
- reconstrói a aba `Resumo`;
- preserva o histórico.

## Continuidade da sequência

A sequência é calculada separadamente para cada classe. O primeiro professor do novo trimestre é o próximo professor ativo depois daquele que encerrou o trimestre anterior.

Exemplo:

```text
Rita → Thaís → Alessandra
```

Se Rita estiver no último domingo, o trimestre seguinte começa com Thaís.

## Recuperação

Antes da preparação de um novo trimestre, o sistema cria uma aba oculta com nome iniciado por `BACKUP_ESCALA_`. Para recuperar:

1. abra a planilha;
2. use **Exibir > Planilhas ocultas**;
3. abra a aba de backup;
4. copie os dados necessários para `Escala EBD`.

Para as lições, não existe histórico semanal intencional. Cada salvamento substitui a versão anterior. Caso seja necessário preservar excepcionalmente uma lição, faça manualmente uma cópia do arquivo no Google Drive antes de substituí-lo.

## Operação de emergência

- Arquivamento manual: painel **Escalas salvas**.
- Verificação imediata: **Verificar e arquivar agora**.
- Reparar gatilho: **Instalar / reparar automação**.
- Reparar lições: botão **Preparar / reparar Google Drive** ou função `migrarLicoesParaDriveEBD`.
- Conferir API: abrir a URL `/exec?acao=licoes`; a resposta deve indicar `armazenamento: google_drive`.

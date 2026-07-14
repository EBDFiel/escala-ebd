# Escala EBD — Documentação completa

## Versão
Automação trimestral e continuidade da sequência — 14/07/2026.

## Arquitetura

- GitHub Pages: `index.html`, `admin.html`, PWA, imagens e mapa do site.
- Google Apps Script: `Code.gs`.
- Google Sheets: escala operacional, professores, lições, quizzes e históricos.
- Aba operacional única: `Escala EBD`.
- Histórico permanente: `Historico_Escalas`.

## Segurança
Configure nas Propriedades do script:

- `EBD_SENHA_ADMIN`: senha administrativa.
- `EBD_SENHA_TROCA`: senha usada pelos professores.

O backend usa tokens temporários, limite de tentativas, validação de callback JSONP e `LockService` nas operações de escrita.

## Automação trimestral

A automação é instalada pelo painel em **Escalas salvas > Instalar / reparar automação**. Ela cria um gatilho diário para `verificarEncerramentoTrimestralEBD`, programado aproximadamente para 04:15 no fuso `America/Sao_Paulo`.

A verificação diária:

1. lê a última data da aba `Escala EBD`;
2. aguarda o dia seguinte à última aula;
3. identifica ano e trimestre pelas datas;
4. grava cada data e classe em `Historico_Escalas`;
5. ignora IDs já arquivados;
6. marca o trimestre como pronto para preparação.

A automação nunca apaga nem substitui a escala atual.

## Preparação do trimestre seguinte

A preparação é liberada somente quando:

- a última data já passou;
- todos os registros esperados estão arquivados;
- o administrador confirma a ação no painel e digita `PREPARAR`.

Ao preparar, o sistema:

1. cria um backup oculto da aba atual;
2. calcula todos os domingos do próximo trimestre civil;
3. mantém as nove classes e a coluna Suporte;
4. distribui os professores ativos;
5. reaplica listas suspensas e formatação;
6. reconstrói a aba `Resumo`;
7. registra a operação na aba `Histórico`.

## Continuidade da sequência

A ordem é lida de cima para baixo na aba `Professores`, separadamente para cada classe. O sistema identifica o último professor escalado no trimestre encerrado e inicia o trimestre seguinte pelo próximo professor ativo da ordem.

Regras:

- professores com status `Inativo` são ignorados;
- um professor único permanece em todas as datas;
- a sequência de cada classe é independente;
- o Suporte usa sua própria sequência;
- para participar do Suporte, o cadastro pode usar a classe `Suporte` ou conter a palavra “suporte” na observação;
- nomes compostos em uma célula são reconhecidos quando separados por `/`.

Exemplo: Rita → Thaís → Alessandra. Se Rita encerrou o trimestre, o seguinte começa com Thaís.

## Recuperação

Antes de substituir a escala, a preparação cria uma aba oculta com nome semelhante a `BACKUP 3T 2026 20260928-0415`. Para recuperar:

1. abra **Exibir > Abas ocultas**;
2. mostre o backup correspondente;
3. copie apenas os dados necessários;
4. não exclua `Historico_Escalas`.

## Operação de emergência

No painel, o botão **Arquivar escala atual** força uma conferência manual. A operação identifica o período pelas datas e não duplica registros. Se a instalação do gatilho pelo painel pedir autorização, execute uma vez a função `instalarAutomacaoTrimestralEBD` diretamente no editor do Apps Script e autorize.

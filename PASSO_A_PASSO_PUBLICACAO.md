# Passo a passo de publicação — GitHub e Apps Script

## 1. GitHub

Arquivos alterados nesta versão:

- `Code.gs`
- `admin.html`
- `README.md`
- `DOCUMENTACAO_ESCALA_EBD.md`
- `PASSO_A_PASSO_PUBLICACAO.md`
- `mapa-site.html`

No repositório `EBDFiel/escala-ebd`, branch `main`:

1. faça backup ou confirme que a versão atual está commitada;
2. envie os arquivos acima para a raiz do repositório;
3. confirme a substituição;
4. use o commit `Automação trimestral e continuidade da escala`;
5. aguarde o GitHub Actions concluir;
6. teste `https://escala.ebdfiel.com.br` em janela anônima.

Não exclua `CNAME` e não envie os arquivos para a Hostinger.

## 2. Google Apps Script

1. abra a planilha;
2. acesse **Extensões > Apps Script**;
3. faça uma cópia do código atual;
4. substitua todo o `Code.gs` pelo arquivo deste pacote;
5. confirme as propriedades `EBD_SENHA_ADMIN` e `EBD_SENHA_TROCA`;
6. salve;
7. abra **Implantar > Gerenciar implantações**;
8. edite a implantação e selecione **Nova versão**;
9. mantenha a execução como proprietário;
10. implante e autorize os novos escopos solicitados;
11. preserve a URL `/exec` configurada em `index.html` e `admin.html`.

## 3. Ativar a automação

1. abra o painel administrativo;
2. entre em **Escalas salvas**;
3. clique em **Instalar / reparar automação**;
4. confirme;
5. verifique se o status mostra **Automação ativa**.

Caso o navegador não consiga solicitar a autorização necessária:

1. volte ao editor do Apps Script;
2. selecione `instalarAutomacaoTrimestralEBD`;
3. clique em **Executar**;
4. autorize;
5. volte ao painel e atualize o status.

## 4. Testes obrigatórios

1. confira a escala pública;
2. abra **Escalas salvas** e carregue o status;
3. confirme que o período e as datas estão corretos;
4. confirme que a automação está instalada;
5. use **Verificar e arquivar agora**: antes do fim, o sistema deve informar que o trimestre está em andamento;
6. consulte o histórico sem preparar o próximo trimestre;
7. não use o botão de preparação antes de ele ser liberado automaticamente.

# Passo a passo de publicação — Apps Script, Google Drive e GitHub

## Ordem segura

Faça primeiro a atualização do **Google Apps Script**, depois execute a migração das lições e somente então envie os arquivos ao **GitHub**. Assim, a página pública continua lendo a estrutura antiga até o novo backend estar publicado.

## 1. Google Apps Script

1. abra a planilha;
2. acesse **Extensões > Apps Script**;
3. faça uma cópia do código atual;
4. substitua todo o `Code.gs` pelo arquivo deste pacote;
5. confirme as propriedades `EBD_SENHA_ADMIN` e `EBD_SENHA_TROCA`;
6. salve o projeto;
7. abra **Implantar > Gerenciar implantações**;
8. edite a implantação atual;
9. selecione **Nova versão**;
10. mantenha a execução como proprietário;
11. implante e preserve a mesma URL terminada em `/exec`;
12. autorize o acesso ao Google Drive, caso a permissão seja solicitada.

O novo backend continua compatível com o conteúdo antigo da aba `Licoes` enquanto a migração ainda não tiver sido executada.

## 2. Migrar as lições para o Google Drive

Depois que a nova versão estiver implantada:

1. volte ao editor do Apps Script;
2. no seletor de funções, escolha `migrarLicoesParaDriveEBD`;
3. clique em **Executar**;
4. revise e permita o acesso ao Google Drive;
5. aguarde a mensagem de execução concluída.

A função cria a pasta `Escala EBD - Licoes Atuais`, cria os dois arquivos atuais, transfere o conteúdo antigo e somente depois converte a aba `Licoes` em uma tabela de metadados.

## 3. Conferir a migração

Na planilha, a aba `Licoes` deve mostrar somente metadados, com colunas como `ArquivoDriveId`, `NomeArquivo`, `AtualizadoEm`, `TamanhoBytes` e `HashSHA256`.

No Google Drive, deve existir a pasta:

```text
Escala EBD - Licoes Atuais
```

Dentro dela:

```text
licao-adultos.html
licao-jovens.html
```

Não compartilhe esses arquivos publicamente.

## 4. GitHub

Arquivos alterados nesta versão:

- `Code.gs`
- `admin.html`
- `index.html`
- `README.md`
- `DOCUMENTACAO_ESCALA_EBD.md`
- `PASSO_A_PASSO_PUBLICACAO.md`
- `mapa-site.html`

No repositório `EBDFiel/escala-ebd`, branch `main`:

1. confirme que a versão atual está commitada;
2. envie os sete arquivos acima para a raiz do repositório;
3. confirme a substituição;
4. use o commit `Lições atuais no Google Drive`;
5. aguarde o GitHub Actions concluir;
6. não exclua o arquivo `CNAME`;
7. não envie esta atualização para a Hostinger.

## 5. Testes obrigatórios

1. abra o painel administrativo;
2. entre em **Lições interativas**;
3. confirme a indicação **Google Drive ativo**;
4. altere um pequeno trecho de uma das lições;
5. clique em **Substituir lições atuais**;
6. aguarde a confirmação da gravação;
7. abra a página pública em janela anônima;
8. abra a lição alterada;
9. confirme que o trecho novo aparece;
10. recarregue a aba `Licoes` e confira data, tamanho e hash atualizados.

Se o painel informar falta de autorização, execute novamente `migrarLicoesParaDriveEBD` diretamente no editor do Apps Script e autorize o Drive.

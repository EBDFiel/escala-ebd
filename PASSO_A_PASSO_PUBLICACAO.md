# Passo a passo de publicação — Corretivo 3.2

## Objetivo

Corrigir a confirmação do salvamento das lições sem refazer a migração e sem alterar os arquivos atuais do Google Drive.

## 1. Atualize primeiro o Google Apps Script

1. Abra a planilha da Escala EBD.
2. Acesse **Extensões > Apps Script**.
3. Faça uma cópia de segurança do `Code.gs` atual.
4. Substitua todo o conteúdo pelo `Code.gs` deste pacote.
5. Clique em **Salvar**.
6. Abra **Implantar > Gerenciar implantações**.
7. Edite a implantação atual.
8. Selecione **Nova versão**.
9. Mantenha **Executar como: Eu**.
10. Clique em **Implantar**.
11. Preserve a mesma URL terminada em `/exec`.

Não execute novamente `migrarLicoesParaDriveEBD`. A pasta e os arquivos atuais serão reutilizados.

## 2. Atualize o GitHub

Envie para a raiz do repositório:

- `Code.gs`;
- `admin.html`;
- `README.md`;
- `DOCUMENTACAO_ESCALA_EBD.md`;
- `PASSO_A_PASSO_PUBLICACAO.md`;
- `mapa-site.html`.

Mensagem sugerida de commit:

```text
Corretivo 3.2 da confirmação das lições
```

Aguarde o GitHub Actions concluir. Não exclua o `CNAME` e não envie estes arquivos para a Hostinger.

## 3. Teste final

1. Abra o painel e use `Ctrl + F5`.
2. Entre em **Lições interativas**.
3. Faça uma pequena alteração de teste.
4. Clique em **Substituir lições atuais**.
5. Aguarde a mensagem de sucesso.
6. Abra a página pública e confira a lição.
7. Confirme que a escala semanal, o histórico e a automação trimestral continuam funcionando.

O botão **Preparar / reparar Google Drive** só deve ser usado quando o painel informar especificamente que os arquivos não estão preparados.

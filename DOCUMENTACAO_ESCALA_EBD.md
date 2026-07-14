# Escala EBD — Documentação da Atualização 1

## Versão
Estabilização e sincronização — 14/07/2026.

## Fonte operacional
A aba `Escala EBD` é a única escala operacional. A aba antiga foi renomeada para `ARQUIVO - Escala 3T 2026`.

## Classes suportadas
Cordeirinhos de Cristo; Soldadinhos de Cristo; Heróis e Amigos; Mensageiros de Cristo; Vencedores por Cristo; Vivendo em Cristo; Testemunhas de Cristo; Sara; Heróis da Fé; Suporte.

## Segurança
O Apps Script não usa mais senha fixa no arquivo. Configure em **Configurações do projeto > Propriedades do script**:

- `EBD_SENHA_ADMIN`: senha do painel administrativo.
- `EBD_SENHA_TROCA`: senha usada pelos professores para solicitar troca.

O backend emite tokens temporários, limita tentativas e usa `LockService` nas alterações.

## Publicação
Depois de substituir o `Code.gs`, crie uma nova implantação do tipo Aplicativo da Web. Execute como proprietário e permita acesso conforme a política da igreja. Se a URL da implantação mudar, substitua a URL do Apps Script em `index.html` e `admin.html`.

## Recuperação
Antes desta atualização foi criada uma cópia integral da planilha no Google Drive. Em caso de problema, não apague a planilha atual: use a cópia de segurança e restaure apenas os dados necessários.

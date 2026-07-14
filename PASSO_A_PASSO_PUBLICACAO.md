# Passo a passo de publicação

## 1. Hostinger
1. Faça backup da pasta atual do site.
2. Abra o Gerenciador de Arquivos da Hostinger.
3. Entre na pasta onde o Escala EBD está publicado.
4. Envie o conteúdo deste pacote, mantendo a mesma estrutura de pastas.
5. Substitua `index.html`, `admin.html`, `admin-escala-whatsapp.html`, manifestos, service worker, imagens e demais arquivos do pacote.
6. Limpe o cache da Hostinger e do navegador.

## 2. Google Apps Script
1. Abra **Extensões > Apps Script** na planilha.
2. Faça uma cópia do código atual.
3. Apague o conteúdo do arquivo `Code.gs` e cole o `Code.gs` deste pacote.
4. Abra **Configurações do projeto > Propriedades do script**.
5. Crie `EBD_SENHA_ADMIN` com a senha administrativa desejada.
6. Crie `EBD_SENHA_TROCA` com a senha de troca desejada.
7. Salve o projeto.
8. Clique em **Implantar > Gerenciar implantações**.
9. Edite a implantação existente ou crie uma nova implantação do tipo **Aplicativo da Web**.
10. Execute como proprietário e mantenha o acesso necessário para o site.
11. Copie a URL final `/exec` e confira se ela é a mesma configurada em `index.html` e `admin.html`.

## 3. Testes obrigatórios
1. Abra o site em janela anônima.
2. Confirme a exibição de Mensageiros de Cristo.
3. Entre no painel com `EBD_SENHA_ADMIN`.
4. Teste listar escala, professores e histórico.
5. Cadastre um telefone de teste e gere um aviso do WhatsApp.
6. Faça uma troca de teste usando `EBD_SENHA_TROCA` e confira o histórico.
7. Confirme que a aba `ARQUIVO - Escala 3T 2026` não é usada pelo site.

# 🌐 Guia de Deploy na Hostinger — IASIS AGENDA

O **IASIS AGENDA** é construído como uma Single Page Application (SPA) em React com Vite.
Ele pode ser hospedado facilmente em qualquer plano da Hostinger (Hospedagem Compartilhada cPanel/hPanel, Cloud ou VPS).

---

## 🛠️ Passo a Passo para Hospedagem Web / hPanel Hostinger

### 1. Gerar os arquivos estáticos de produção
No seu computador, no diretório do projeto, execute:
```bash
npm run build
```
Isso criará uma pasta chamada `dist/` com todos os arquivos HTML, JS, CSS, fontes e imagens otimizados.

### 2. Configurar o arquivo `.htaccess` para roteamento SPA
Para que rotas diretas (como `/agenda` ou `/clientes`) não retornem erro 404 no servidor Apache da Hostinger, o arquivo `.htaccess` já deve estar dentro da pasta `dist/` ou na raiz do seu `public_html`.

Crie um arquivo chamado `.htaccess` com o seguinte conteúdo:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache headers para performance
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 3. Enviar os arquivos para o Gerenciador de Arquivos da Hostinger
1. Acesse o **hPanel da Hostinger** -> **Sites** -> selecione seu domínio.
2. Abra o **Gerenciador de Arquivos** (File Manager).
3. Entre na pasta `public_html`.
4. Faça o upload de todo o conteúdo de dentro da pasta `dist/` para a raiz da `public_html`.
5. Certifique-se de que o arquivo `.htaccess` esteja presente no `public_html`.

### 4. Ativar SSL / HTTPS
No hPanel da Hostinger, vá em **Segurança** -> **SSL** e ative o certificado gratuito Let's Encrypt para o seu domínio.

---

## 🔒 Variáveis de Ambiente no Build
Como o Vite compila as variáveis `VITE_*` no momento do build, certifique-se de que o seu `.env` local (ou na esteira de CI/CD) esteja configurado com as URLs e chaves corretas do Supabase antes de rodar `npm run build`.

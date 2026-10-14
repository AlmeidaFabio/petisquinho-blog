# Petisquinho

Blog estático em Astro para publicar textos curtos sobre cultura, curiosidades e variedades.

## Stack

- Astro
- Tailwind CSS
- Markdown para conteúdo editorial
- RSS e sitemap em produção
- Busca local em JavaScript

## Como rodar

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Preparar e publicar posts

Os arquivos em `docs/posts` ficam fora do site até serem preparados para publicação.
O comando de deploy otimiza imagens JPG/JPEG, PNG, WebP, GIF, AVIF, TIFF e SVG
de `docs/imgs` para WebP (qualidade 80, largura máxima de 1600 px), coloca as imagens em `public/images/posts` e copia
os posts Markdown para `src/content/posts` antes da build. A pasta `docs` fica
fora do site publicado. As imagens originais em `docs/imgs` e os posts Markdown em
`docs/posts` são apagados somente depois que o upload FTPS termina com sucesso;
falhas anteriores preservam os arquivos originais. Se um post com o mesmo nome
já existir na pasta de produção e tiver conteúdo diferente, o processo para sem
sobrescrevê-lo.

```bash
npm run prepare:deploy
```

O comando `npm run deploy:hostgator` executa essa preparação automaticamente
antes de gerar e enviar a build. Executar somente `npm run prepare:deploy` não
apaga as imagens nem os posts originais.

## Deploy para HostGator

Este projeto envia a build estática usando FTPS explícito (FTP protegido por TLS), na porta 21 por padrão. O certificado do servidor é validado pelo Node.js; não desative essa validação.

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Preencha as credenciais FTPS do HostGator no `.env`:

```env
HOSTGATOR_HOST=ftp.seudominio.com
HOSTGATOR_PORT=21
HOSTGATOR_USER=seu_usuario_ftp
HOSTGATOR_PASSWORD=sua_senha_ftp
HOSTGATOR_REMOTE_PATH=/public_html
# Opcional: nome DNS do certificado FTPS quando HOSTGATOR_HOST for um IP
HOSTGATOR_TLS_SERVERNAME=servidor.hostgator.com.br
```

3. Rode o deploy:

```bash
npm run deploy:hostgator
```

A rotina faz `npm run build` automaticamente e envia o conteúdo da pasta `dist` para o diretório remoto configurado.

> No painel da hospedagem, confirme que a conta permite FTPS explícito. O padrão é porta 21; use a porta e o host FTPS informados pelo HostGator. Este script não usa SFTP. O caminho remoto é relativo à raiz visível da conta FTP: se a conta FTP estiver limitada diretamente à raiz pública do domínio, use `/`; se estiver limitada à pasta pessoal, use o caminho da raiz do domínio que esteja acessível dentro dessa conta. Não tente contornar a limitação da conta com `..`.

## Estrutura principal

- `src/content/posts` — artigos em Markdown
- `docs/posts` — posts aguardando publicação
- `docs/imgs` — imagens originais dos posts
- `src/pages` — páginas do blog e rotas estáticas
- `src/layouts` — layout base do site
- `src/styles` — estilos globais
- `public` — assets públicos

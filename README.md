# Petisquinho

Blog de leitura rápida sobre cultura, curiosidades e variedades. Estático de ponta a ponta — HTML, CSS, imagens e um `.htaccess`, sem servidor de aplicação, banco de dados ou processo Node em produção.

**[petisquinho.com](https://petisquinho.com)**

![Página inicial do Petisquinho](docs/assets/home.webp)

## O que é

Cada post responde uma pergunta concreta em poucos minutos: por que o céu é azul, como calcular a distância de uma tempestade pelo trovão, o que a regra 3-2-1 de backup resolve. Texto curto, fontes citadas e ilustrações próprias.

O site é gerado com Astro e não carrega framework de UI nem JavaScript de terceiros. Os dois únicos scripts de cliente — o carrossel da home e a busca — são escritos à mão e embutidos na página.

## Stack

| | |
|---|---|
| Framework | Astro 5, geração estática |
| Estilo | Tailwind CSS 3 |
| Conteúdo | Markdown com frontmatter validado por Zod |
| Imagens | `sharp` — variantes responsivas e cartões de compartilhamento |
| Deploy | FTPS explícito para HostGator, atrás da Cloudflare |
| Node | 24 |

## Rodando localmente

```bash
npm install
npm run dev
```

O `predev` gera as variantes responsivas das imagens antes de subir o servidor. O site fica em `http://localhost:4321`.

Para conferir a build de produção:

```bash
npm run build
npm run preview
```

## Escrevendo um post

O guia completo está em [docs/direcao-editorial.md](docs/direcao-editorial.md): pauta, pesquisa, palavra-chave, hierarquia de cabeçalhos, tamanho, metadados e o prompt da imagem de capa.

O fluxo, em resumo:

1. Escreva o post em `docs/posts/`, com `.md`
2. Coloque a capa em `docs/imgs/`
3. Rode `npm run deploy`

A preparação converte a imagem para WebP, copia o post para `src/content/posts/` e só apaga a caixa de entrada depois que o upload termina com sucesso. Um post com o mesmo nome já publicado e conteúdo diferente interrompe o processo em vez de sobrescrever.

### O que a build recusa

Nem todo post chega em produção. A build para, antes de gerar qualquer página, quando encontra:

- **imagem raster** em `public/images/posts/` — `.jpg`, `.png`, `.gif` e afins. A pasta é destino do pipeline, não origem: arquivo colocado à mão pula a conversão e iria para o ar no tamanho original
- **capa inexistente** — `image:` no frontmatter apontando para arquivo que não existe
- **link interno quebrado** — post ou categoria inexistente, link sem barra final, página de categoria além da última, ou caminho desconhecido

A checagem de fontes fica fora da build porque depende de rede, e uma queda de DNS não deveria impedir uma publicação:

```bash
npm run checar-fontes
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento em `:4321` |
| `npm run build` | checagens, variantes, cartões de OG e build em `dist/` |
| `npm run preview` | serve a build de produção localmente |
| `npm run prepare:deploy` | converte imagens e copia os posts da caixa de entrada |
| `npm run deploy` | prepara, gera a build e envia por FTPS |
| `npm run checar-fontes` | confere as fontes citadas nos posts, com acesso à rede |

## Deploy

O envio é por **FTPS explícito** (FTP sobre TLS), com validação do certificado. Não é SFTP, e a validação não deve ser desativada.

As credenciais ficam em `.env`, fora do versionamento:

```bash
cp .env.example .env
```

Variáveis: `HOSTGATOR_HOST`, `HOSTGATOR_PORT`, `HOSTGATOR_USER`, `HOSTGATOR_PASSWORD`, `HOSTGATOR_REMOTE_PATH` e, quando o host for um IP, `HOSTGATOR_TLS_SERVERNAME`.

O envio manda **primeiro os assets** (`_astro/`, `images/`, `og/`) e **depois o HTML**. Não é detalhe: como o CSS carrega hash de conteúdo no nome, subir o HTML antes abre uma janela em que a página nova pede um arquivo que ainda não existe. O 404 dessa janela fica em cache na borda, e o site aparece sem estilo mesmo depois que o arquivo chega.

Em produção, o `.htaccess` cuida do resto:

- HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`
- http e www redirecionando para `https://petisquinho.com`
- 410 para os arquivos que saíram do repositório, que o deploy não apaga no servidor
- cache longo e imutável para CSS e JS, que carregam hash de conteúdo

## Estrutura

```
src/
  components/     carrossel, cards, paginação
  config/         dados do site: nome, autor, categorias
  content/        coleção de posts e schema do frontmatter
  layouts/        layout base, cabeçalho e rodapé
  pages/          rotas
  styles/         estilos globais
  utils/          posts, imagens, schema.org, categorias
public/
  images/posts/   capas publicadas — destino do pipeline
  og/             cartões de compartilhamento
  .htaccess       cabeçalhos, redirecionamentos e cache
docs/             documentação e caixa de entrada, fora do site
scripts/          pipeline: checagens, variantes, OG e deploy
```

A pasta `docs/` **não vai para o site publicado**. Ela reúne a documentação, os rascunhos e a caixa de entrada do pipeline.

## Documentação

- [Direção editorial](docs/direcao-editorial.md) — como escolher, escrever e revisar um post
- [PRD](docs/PRD%20-%20Blog%20Petisquinho.md) — escopo e requisitos do projeto
- [Segurança](docs/seguranca.md) — o que foi verificado e o que segue em aberto

## Qualidade

Medido em 16/10/2026, no celular e no desktop: Lighthouse 100 em Acessibilidade, SEO e Boas Práticas; Performance entre 98 e 100; LCP de 1,5 s e CLS zero.

## Licença

O conteúdo e as ilustrações são de autoria própria. O código não tem licença de uso definida.

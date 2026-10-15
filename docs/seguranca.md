# Estado de segurança do site

Verificação de **16/10/2026**, feita de fora, contra o site em produção
(`https://petisquinho.com`). Não é teste de invasão: é auditoria de
configuração, olhando o que qualquer visitante consegue ver.

Para repetir, o script está em `_audit/auditoria-seguranca.mjs` (fora do
repositório, junto dos outros scripts de verificação).

## Resumo

| Camada | Estado |
|---|---|
| TLS | TLS 1.3, AES-256-GCM, certificado válido |
| Cabeçalhos de segurança | 6 de 6 presentes |
| Content Security Policy | Restritiva, sem curinga e sem `unsafe-eval` |
| Redirecionamentos | http e www convergem para https sem www |
| Conteúdo misto | zero recursos http numa página https |
| Arquivos expostos | zero em 22 sondagens |
| Segredos no repositório | nenhum valor real versionado |
| XSS no código próprio | nenhuma superfície encontrada |

## TLS

```
protocolo   TLSv1.3
cifra       TLS_AES_256_GCM_SHA384
emissor     Google Trust Services
validade    21/08/2026 a 20/11/2026
nomes       petisquinho.com, *.petisquinho.com
```

O certificado é gerenciado pela Cloudflare e renovado automaticamente. O
curinga cobre subdomínios, o que importa para `simula-prova`.

O cabeçalho do servidor diz `cloudflare`. A origem não se anuncia, o que
dificulta apontar um ataque direto para o HostGator em vez de passar pela
borda.

## Cabeçalhos

```
strict-transport-security   max-age=31536000
content-security-policy     default-src 'self'; base-uri 'self';
                            object-src 'none'; frame-ancestors 'none';
                            form-action 'self'; img-src 'self' data:;
                            style-src 'self' 'unsafe-inline';
                            script-src 'self' 'unsafe-inline'
                              https://static.cloudflareinsights.com;
                            font-src 'self';
                            connect-src 'self' https://cloudflareinsights.com;
                            manifest-src 'self';
                            upgrade-insecure-requests
x-content-type-options      nosniff
x-frame-options             DENY
referrer-policy             strict-origin-when-cross-origin
permissions-policy          camera=(), microphone=(), geolocation=()
```

A política não usa curinga como origem, bloqueia `object` e `frame-ancestors`,
impede `unsafe-eval` e restringe formulários à própria origem. O
`upgrade-insecure-requests` cobre o caso de algum recurso escapar em http.

## Redirecionamentos e conteúdo misto

```
http://petisquinho.com/      301 -> https://petisquinho.com/
http://www.petisquinho.com/  301 -> https://petisquinho.com/
https://www.petisquinho.com/ 301 -> https://petisquinho.com/
```

Nenhum recurso `http://` na home servida por https. Zero ocorrências.

## Arquivos que não devem ser públicos

22 sondagens, **nenhuma respondeu 200**:

```
404  /.env.example  /.git/HEAD  /.git/config  /package.json
     /package-lock.json  /docs/  /scripts/  /src/content/posts/
     /dist/  /node_modules/  /npm-debug.log  /backup.zip
     /_audit/  /.gitignore  /public/.htaccess  /astro.config.mjs
     /tailwind.config.mjs
403  /.htaccess  /wp-config.php
406  /.env
```

Os 403 são o Apache protegendo arquivos `.ht*` e o HostGator bloqueando
`wp-config.php`. O 406 em `/.env` indica alguma camada recusando a requisição
antes de servir qualquer coisa — melhor que 404, porque não confirma nem nega
a existência.

Os source maps não são publicados: nenhum arquivo `.map` na build.

## Segredos

- `.env` está no `.gitignore` e **não é rastreado** pelo git.
- `.env.example` e `README.md` trazem apenas nomes de variável e valores de
  exemplo (`seu_usuario_ftp`, `sua_senha_ftp`).
- Nenhum arquivo versionado contém valor de credencial.

As credenciais FTPS vivem em variáveis de ambiente, lidas pelo script de
deploy. Elas nunca passam pelo repositório.

## XSS no código próprio

A busca lê `?q=` da URL. O caminho do dado:

- entra em `input.value`, que é atribuição de propriedade, não HTML;
- os resultados são montados com `createElement` e `textContent`.

Contagem em `busca.astro`: **0 `innerHTML`, 0 `insertAdjacentHTML`, 0 `eval`,
0 `new Function`**. Nas 38 páginas geradas, 0 ocorrências de `innerHTML`.

## Rastreamento e cookies

O site não define cookies próprios, então não há banner de consentimento nem
superfície de LGPD para tratar. O único terceiro previsto na política é o
Cloudflare Insights, ainda não ativado.

## Pendências, em ordem de peso

### 1. `script-src 'unsafe-inline'`

É a única concessão real da política, e é arquitetural: os scripts do site são
todos embutidos no HTML. Enquanto ela existir, uma injeção de HTML executaria
JavaScript.

Dá para trocar por hashes. Como o site é estático, o build calcula o SHA-256 de
cada script embutido e escreve os hashes na política, no lugar de
`'unsafe-inline'`. O custo é que qualquer mudança em um script muda o hash, o
que exige o `.htaccess` ser gerado na build — o que já acontece, porque ele vem
de `public/`.

### 2. Comentários internos no HTML público

São **154 comentários em 38 páginas**. Nenhum cita senha, servidor, caminho
interno ou configuração de segurança — são justificativas de decisão, do tipo
"por que o link de pular navegação existe" ou "por que o rodapé usa mostarda".

O risco de segurança é zero. O incômodo é de acabamento: são notas de
desenvolvimento, algumas descrevendo o histórico ("antes a página não tinha
nenhum h1"), visíveis a qualquer visitante e no "ver código-fonte".

Em `.astro`, `<!-- -->` é emitido e `{/* */}` não é. Converter os comentários
de marcação para a forma de expressão resolve na origem, e vale como convenção
em `docs/direcao-editorial.md`.

### 3. HSTS sem `includeSubDomains`

Decisão consciente, registrada no `.htaccess`: `simula-prova` pode não ter
HTTPS, e `mail`/`webmail` dependem de http. Enquanto isso, subdomínios não
herdam a obrigatoriedade de HTTPS.

Vale revisitar se `simula-prova` ganhar HTTPS — aí os três podem ser cobertos.

### 4. `security.txt`

Não existe. É barato: um `/.well-known/security.txt` com um contato para quem
quiser relatar uma falha. Opcional para um blog, mas é o canal que evita um
relato público desnecessário.

## Dependências

`npm audit` em 16/10/2026: **11 avisos — 1 crítico, 6 altos, 3 moderados, 1
baixo**. Quase tudo em `astro`, `sharp` e `tailwindcss`.

O peso disso é menor do que o número sugere, por uma razão estrutural: **o site
é estático e não roda Node em produção**. O que vai para o servidor é HTML,
CSS, imagens e um `.htaccess`. Nenhum desses pacotes executa no HostGator.

Separei por vetor real:

| Pacote | Vetor | Alcança o site? |
|---|---|---|
| `astro` (crítico) | XSS no HTML gerado, RCE na otimização de AVIF | **Não** — nenhum recurso atingido é usado |
| `sharp` (alto) | CVEs de libvips, libheif e librsvg | **Sim, na build** — processa imagem de entrada |
| `esbuild` (baixo) | Leitura de arquivo pelo servidor de dev no Windows | Só em desenvolvimento, em localhost |
| `tailwindcss` (alto) | DoS por glob aninhado, via `braces`/`micromatch` | **Não** — os padrões de glob são nossos |

Os CVEs do Astro atingem `define:vars`, spread props, View Transitions, ilhas
hidratadas com `client:` e nome de slot dinâmico. Conferi um por um no código:

```
define:vars        nao usado
spread props       nao usado
View Transitions   nao usado
client: (ilhas)    nao usado
slot nome dinamico so literal, nao vem de dado
```

O site não tem JavaScript de framework nenhum, então as portas que esses bugs
usam estão fechadas. E não há entrada de dado de terceiro na build: o conteúdo
vem do próprio autor.

O vetor que sobra é o `sharp`, que processa as imagens da caixa de entrada.
Ele roda com imagem do autor ou gerada por IA. Um arquivo malicioso de HEIC ou
SVG seria o caminho — improvável, mas é o único que existe.

### O que dá para fazer

**`sharp` 0.34.5 → 0.35.5** — salto de versão menor, risco baixo, fecha sete
CVEs de libvips, libheif e librsvg. É a atualização que vale fazer.

**`astro` 5.18.2 → 7.4.0** — não existe versão corrigida dentro da linha 5: a
correção só veio nas versões maiores. É migração com quebras, não atualização
de segurança. Como nenhum vetor alcança o site, trate como trabalho planejado,
não como urgência.

**`tailwindcss` 3.4.19 → 4.3.3** — também é salto maior, com reescrita de
configuração. Os avisos são de negação de serviço na build, com padrões de glob
que nós mesmos escrevemos. Não compensa agora.

## O que esta verificação NÃO cobriu

Para não passar uma impressão maior do que a evidência sustenta:

- **Painel da HostGator**: usuários FTP, permissões de arquivo, backups e
  versões de PHP/MySQL não foram olhados. Só o que o site serve.
- **Conta na Cloudflare**: 2FA, tokens de API, regras de WAF, limitação de
  taxa e o que está de fato ativado na borda. Não tenho acesso.
- **Força e rotação da senha FTP**: não há como avaliar de fora.
- **IP de origem**: a Cloudflare esconde, mas o IP pode ter vazado antes do
  proxy e continuar descobrível por histórico de DNS.
- **Teste de invasão**: nada aqui tentou explorar falha. É auditoria de
  configuração visível de fora.
- **Peso de cada CVE**: li os títulos das vulnerabilidades e conferi quais
  recursos o código usa. Não estudei cada exploração em detalhe, nem verifiquei
  se algum CVE do Astro tem caminho que eu não considerei.

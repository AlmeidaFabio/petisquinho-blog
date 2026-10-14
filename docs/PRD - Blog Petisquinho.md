# PRD — Blog Petisquinho

Oct 9, 2026 · @Fabio Almeida

## Visão geral

O Petisquinho é um blog brasileiro de textos curtos sobre cultura, curiosidades e variedades, pensado para leituras de 2 a 4 minutos.

**Problema.** Conteúdo curioso e cultural existe de sobra, mas está espalhado em textões, vídeos longos e posts de clickbait. Quem quer aprender algo e se distrair em poucos minutos não tem um lugar leve, confiável e com identidade brasileira.

**Proposta de valor.** "Uma porção de curiosidade por dia, sem compromisso." Cada post é uma porção: curto, com tempo de leitura declarado, fontes citadas e algo para levar embora.

**Domínio.** petisquinho.com, já registrado pelo autor. O petisquinho.com.br está registrado por terceiros e aparentemente sem uso (ver Riscos).

**Decisões do autor.** Autor único com 8 horas ou mais por semana, hospedagem na HostGator, sem newsletter e sem mascote no início.

## Objetivos e métricas de sucesso

O objetivo central é criar o hábito de leitura e construir audiência própria por busca e redes antes de lançar a newsletter. As metas abaixo são hipóteses para calibrar após os primeiros 90 dias.

| Métrica | 3 meses | 6 meses | 12 meses |
| --- | --- | --- | --- |
| Posts publicados (acumulado) | 36 | 75 | 150 |
| Visitantes únicos por mês | 500 | 3.000 | 15.000 |
| Visitas vindas de busca orgânica | 10% | 30% | 50% |
| Tempo médio na página (min) | 1,5 | 1,75 | 2,0 |

## Público-alvo e personas

O blog fala com três perfis de leitor curioso, todos lendo principalmente no celular. Os perfis são hipóteses a validar com os dados dos primeiros meses.

| Persona | Quando lê | Como chega | O que quer |
| --- | --- | --- | --- |
| Curioso de intervalo | Entre tarefas, no ônibus, na fila | Instagram, TikTok, WhatsApp | Aprender algo em 2 minutos e poder compartilhar |
| Buscador de respostas | Quando uma dúvida surge | Google ("por que o céu é azul") | Resposta clara, confiável e sem enrolação |
| Caçador de dicas culturais | Noite e fim de semana | Newsletter, Pinterest | Indicação de série, livro ou filme que valha o tempo |

## Escopo

O MVP é um blog estático e rápido, sem newsletter nem mascote, lançado com 10 posts; o resto espera os primeiros dados de leitura.

**MVP**

- Home com posts recentes e destaque da semana
- Página de post com tempo de leitura, fontes e botões de compartilhar
- Quatro páginas de categoria
- Páginas Sobre e Contato
- Busca simples
- RSS, sitemap e meta tags para redes sociais
- Analytics sem cookies
- 10 posts publicados no lançamento

**Depois do MVP**

- Posts relacionados e tags
- Newsletter com confirmação por e-mail e envio semanal do "Cardápio da Semana"
- Modo escuro
- Série "Curiosidades do Maranhão"

**Fora de escopo**

- Login e contas de leitor
- Comentários próprios
- Loja virtual e aplicativo nativo
- Anúncios programáticos
- Mascote e stickers (decisão do autor para o projeto inicial)

## Conteúdo e linha editorial

O conteúdo se organiza em quatro seções fixas e cinco formatos recorrentes, com publicação de três posts por semana.

| Seção | Foco | Exemplo de post |
| --- | --- | --- |
| Petisco Cultural | Livros, séries, filmes, música, artistas | "3 séries curtas para ver numa noite" |
| Curiosidades de Boteco | Fatos, ciência simples, histórias do mundo | "Por que o céu é azul?" |
| Mix de Variedades | Comportamento, cotidiano, internet, tecnologia | "Detox digital: vale a pena?" |
| A Saideira | Crônica, opinião, post leve de domingo | Reflexão semanal do autor |

**Formatos fixos**

- Porção Rápida: uma curiosidade em até 150 palavras
- Prato do Dia: texto de 600 a 900 palavras sobre um tema mais fundo
- Combo: lista de 5 itens (séries, livros, fatos, apps)
- Cardápio da Semana: post semanal com os melhores posts e uma indicação extra (vira newsletter quando ela existir)
- De Grátis: dica bônus curta no fim do post

**Regras editoriais**

- Todo post responde "e daí?": por que importa ou diverte.
- Tempo de leitura sempre no topo do post.
- Fontes citadas no final, com checagem em pelo menos duas fontes para fatos e ciência.
- Tom de conversa entre amigos: informal, sem erros e sem sensacionalismo.
- Imagens próprias ou de licença livre; nunca copiar texto de terceiros.

**Calendário semanal**

| Dia | Seção |
| --- | --- |
| Segunda | Curiosidades de Boteco |
| Quarta | Petisco Cultural |
| Sexta | Mix de Variedades |
| Domingo (opcional) | A Saideira |

## Requisitos funcionais

Doze requisitos cobrem o site; os sete primeiros formam o MVP.

| ID | Requisito | Fase |
| --- | --- | --- |
| RF1 | Home com posts recentes e destaque da semana | MVP |
| RF2 | Página de post: título, seção, data, tempo de leitura, corpo, fontes e "De Grátis" | MVP |
| RF3 | Quatro páginas de categoria com paginação | MVP |
| RF4 | Busca por título e texto, executada no navegador | MVP |
| RF5 | Compartilhar por WhatsApp, X e copiar link | MVP |
| RF6 | Feed RSS e sitemap.xml | MVP |
| RF7 | Páginas Sobre e Contato | MVP |
| RF8 | Posts relacionados e tags | v1.1 |
| RF9 | Inscrição na newsletter com confirmação por e-mail (double opt-in) | v1.1 |
| RF10 | Cardápio da Semana enviado automaticamente por newsletter | v1.1 |
| RF11 | Modo escuro | v1.1 |
| RF12 | Série "Curiosidades do Maranhão" com filtro próprio | v1.1 |

## Requisitos não funcionais

O site precisa carregar rápido no celular com 4G, ser encontrável no Google e respeitar a LGPD sem banner de cookies.

| Área | Requisito | Meta |
| --- | --- | --- |
| Performance | Site estático com cache de navegador, imagens otimizadas e carregamento tardio; CDN gratuita opcional na frente da HostGator | LCP abaixo de 2,5 s no 4G; Lighthouse ≥ 90 |
| SEO | URLs limpas, títulos e descrições por post, Open Graph, dados estruturados Article, sitemap | Todos os posts indexáveis |
| Acessibilidade | Contraste adequado, texto alternativo, navegação por teclado | WCAG 2.1 nível AA |
| Segurança | HTTPS obrigatório (certificado ativado no painel da hospedagem), cabeçalhos HSTS e CSP, dependências atualizadas, sem painel administrativo exposto | Nota A em teste de cabeçalhos |
| Privacidade (LGPD) | Política de privacidade, analytics sem cookies e consentimento explícito quando a newsletter existir | Sem banner de cookies |
| Formulário de contato | Proteção anti-spam | Sem mensagens de spam |
| Responsividade | Projeto mobile first | Funcional a partir de 360 px de largura |

## Arquitetura técnica sugerida

Os posts são escritos em Markdown, versionados no Git e publicados como um site estático na HostGator, sem banco de dados nem servidor para manter.

&#91;embedded content: arquitetura · publicação e serviços externos\]

Cada push no repositório dispara o build, e o resultado é enviado à HostGator por SFTP ou FTP; o leitor só acessa arquivos estáticos, e apenas o analytics é serviço externo.

| Camada | Escolha sugerida | Motivo |
| --- | --- | --- |
| Site | Astro com conteúdo em Markdown e Tailwind | Gera HTML estático: rápido, seguro e fácil de manter |
| Hospedagem | HostGator (já contratada) | Serve arquivos estáticos sem configuração especial; acesso por SFTP ou FTP e HTTPS já confirmados no plano atual |
| Publicação | GitHub Actions enviando o build por SFTP, ou upload manual | Um push publica o site; o upload manual serve de plano B |
| CDN (opcional) | Cloudflare, plano gratuito | Cache e proteção na frente da HostGator, se o desempenho pedir |
| Busca | Pagefind | Índice gerado no build, sem servidor |
| Analytics | Plausible ou Umami | Sem cookies, sem banner |
| Domínio | petisquinho.com na raiz; www redireciona para a raiz | Blog na raiz, apps em subdomínios como simula-prova |

## Identidade visual

A identidade é acolhedora e moderna, com terracota como cor principal, azul-marinho para dar seriedade cultural e mostarda reservada a destaques. Os valores hexadecimais são ponto de partida para testar.

| Cor | Hex | Uso |
| --- | --- | --- |
| Terracota | #C8553D | Cor principal, títulos e logotipo |
| Azul-marinho | #1F2A44 | Texto de destaque, rodapé, fundos escuros |
| Mostarda | #E9B44C | Botões, links e marcações |
| Creme | #FAF5EC | Fundo geral |
| Grafite | #2B2B2B | Texto corrido |

- **Tipografia:** títulos em fonte arredondada (Nunito, Quicksand ou Fredoka); texto corrido em fonte de alta legibilidade (Inter ou Source Sans).
- **Logotipo:** "petisquinho" em caixa baixa, tipografia arredondada, com um detalhe minimalista no "i" (faísca de ideia ou balão de fala).
- **Ícones por seção:** palito com azeitona (cultura), lupa (curiosidades), prato dividido (variedades), copo pequeno (saideira).
- **Capas de post:** um único modelo reaproveitável, com título grande e tempo de leitura em destaque.

## Distribuição e crescimento

Cada post nasce uma vez e é reaproveitado em vários canais; com um autor e 8 horas ou mais por semana, o início se concentra em blog, Google e Instagram, e os demais canais entram depois, junto com a newsletter.

| Canal | Formato | Frequência | Início |
| --- | --- | --- | --- |
| Blog | Post "Cardápio da Semana" com os melhores da semana | Semanal | Sim |
| Instagram | Carrossel de cada Porção Rápida | 3 por semana | Sim |
| Google | Posts que respondem perguntas reais de busca | Contínuo | Sim |
| TikTok e Reels | Vídeo de 30 segundos com a curiosidade | 2 por semana | Depois |
| Pinterest | Pin com a capa de cada post | 1 por post | Depois |
| WhatsApp ou Telegram | Canal com a porção da semana | Semanal | Depois |

**SEO.** Antes de escolher pautas de curiosidade, pesquisar as perguntas que as pessoas realmente buscam (sugestões do Google, "as pessoas também perguntam"), porque buscas de cauda longa são a principal fonte de tráfego orgânico desse tipo de conteúdo.

**Nome nas redes.** Reservar o mesmo @ em todas as plataformas antes do lançamento, mesmo nas que não serão usadas de início.

## Roadmap e marcos

O lançamento acontece na semana 7, depois de seis semanas de fundação e MVP, e cada fase só avança quando cumpre seu critério.

&#91;embedded content: roadmap · 5 fases, 5 critérios\]

Os critérios de passagem vêm das metas de 3, 6 e 12 meses e dos requisitos não funcionais deste documento.

## Riscos, premissas e questões em aberto

O maior risco é de constância, não técnico: um blog com menos de três posts por semana perde o hábito do leitor e o ganho de SEO.

| Risco | Mitigação |
| --- | --- |
| Abandono por falta de cadência | Manter 3 posts por semana, que cabem nas 8 h semanais do autor, e formar um estoque de 10 posts de reserva antes do lançamento |
| Tempo do autor cair abaixo de 8 h por semana | Reduzir para 2 posts por semana antes de interromper o blog |
| Domínio .com.br registrado por terceiros, aparentemente sem uso | Usar petisquinho.com como endereço oficial e único; verificar no Registro.br a situação do .com.br e acompanhá-lo; reservar variações ainda livres |
| Confusão com restaurantes e marcas de nome igual | Pesquisar "petisquinho" no Google, nas redes e no INPI antes de investir em identidade visual |
| Informação errada em curiosidades | Checar em pelo menos duas fontes e citar as fontes em todo post |
| Direitos autorais de textos e imagens | Texto autoral, imagens próprias ou de licença livre, sem cópia de terceiros |
| Dependência das redes sociais | Priorizar SEO desde o início e lançar a newsletter na fase de Crescimento |
| Público confuso com o app de quiz no subdomínio simula-prova.petisquinho.com | Manter o blog na raiz e apenas um link discreto para o app no rodapé |

**Questões em aberto**

- Vale registrar variações do domínio (.net, .blog) para proteger a marca?
- Quando lançar a newsletter e com qual serviço? Decidir após os primeiros 3 meses.

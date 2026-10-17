# Direção editorial para novos posts

Este documento orienta a pauta, a pesquisa, a escrita e a publicação de novos artigos no Petisquinho. A meta é entregar textos curtos, interessantes, claros e confiáveis, com identidade própria e sem preencher espaço com generalidades.

## Proposta do Petisquinho

O Petisquinho é um blog brasileiro de leitura rápida sobre cultura, curiosidades e variedades. Cada artigo deve oferecer uma ideia específica que o leitor consiga entender e levar consigo em poucos minutos.

**Promessa editorial:** uma porção de curiosidade por dia, sem compromisso e sem enrolação.

## Categorias

Use uma das categorias já existentes:

- **Papo de Boteco** — ciência cotidiana, linguagem, memória, cultura popular e perguntas curiosas que rendem uma boa conversa.
- **Petisco Cultural** — livros, filmes, séries, música, arte e recomendações culturais.
- **Mix de Variedades** — tecnologia, hábitos, aprendizado e temas diversos do dia a dia.
- **A Saideira** — crônicas leves, reflexões e observações do cotidiano.

Os valores técnicos de `category` são `curiosidades-de-boteco`, `petisco-cultural`, `mix-de-variedades` e `a-saideira`, respectivamente. Mantenha o valor técnico existente mesmo que o nome visível da categoria mude.

## Critérios para escolher uma pauta

Antes de escrever, responda:

1. Qual pergunta concreta o artigo responde ou qual ideia específica apresenta?
2. Por que isso pode interessar ao público do Petisquinho?
3. Que fatos, exemplos ou recomendações verificáveis sustentam o texto?
4. O tema cabe em um artigo curto sem prometer mais do que entrega?

Prefira pautas com recorte claro. Evite títulos genéricos e temas que só permitam repetir conselhos comuns. Listas devem cumprir o número anunciado e explicar por que cada item foi escolhido.

## Palavra-chave e intenção de busca

Antes de escrever, defina **a palavra-chave primária**: o termo que uma pessoa digitaria no buscador para chegar a este post. Ela é a pergunta que o texto responde, não um rótulo genérico.

- **Uma primária.** Se o texto precisa de dois termos principais para ser descrito, a pauta ainda está difusa.
- **Onde ela precisa aparecer:** no título, no `excerpt`, no `imageAlt` e no primeiro parágrafo. No corpo, entra quando o texto pedir — repetição mecânica o leitor percebe e o buscador ignora.
- **As secundárias são as tags.** Termos próximos e variações reais vão em `tags`, com o vocabulário do site. Não invente grafias só para cobrir combinações.
- **Registre a primária no frontmatter**, no campo `keyword`.

**Intenção de busca** é o que a pessoa quer ao digitar o termo: entender um fenômeno, resolver um problema, decidir o que ler ou assistir. O texto precisa começar entregando isso, não contornando.

- Se o título é uma pergunta, o **primeiro parágrafo responde**.
- Se o termo é de comparação ou escolha, o texto precisa **concluir**, não apenas listar opções.
- Se a intenção é aprender, entregue a explicação inteira no próprio artigo: não empurre a resposta para uma fonte externa.
- Se o termo é de curiosidade (“por que o céu é azul”), a resposta vem antes do contexto histórico ou das exceções.

## Pesquisa e fontes

- Pesquise antes de redigir afirmações factuais. Priorize fontes primárias e confiáveis: órgãos públicos, universidades, artigos científicos, documentação oficial, editoras e páginas oficiais de obras ou serviços.
- Confirme que a fonte citada realmente sustenta a afirmação. Não use apenas o nome de uma instituição ou de uma publicação como decoração.
- Sempre que possível, registre links diretos para os materiais consultados. Evite links para a página inicial de um veículo quando houver uma página ou estudo específico.
- Para livros, filmes e séries, confira título, autoria, ano e descrição em catálogo ou fonte oficial. Não afirme disponibilidade atual em streaming sem verificá-la; catálogos mudam por país e data.
- Diferencie evidência, interpretação e opinião. Use atribuições claras (“o estudo observou”, “a organização recomenda”, “nesta lista, escolhemos”) e não generalize resultados limitados.
- Em temas de saúde, comportamento, educação ou ciência, não prometa efeitos nem transforme correlação em causalidade. Inclua contexto e limites relevantes.
- Nunca invente dados, citações, pesquisas, credenciais, falas ou fontes. Se uma informação não puder ser confirmada, retire-a ou apresente explicitamente como hipótese/opinião quando apropriado.

## Escrita e estrutura

- Escreva em português brasileiro, com linguagem natural, direta e acolhedora.
- Explique termos técnicos na primeira vez em que aparecerem.
- Dê preferência a frases claras, parágrafos curtos e exemplos concretos.
- Comece respondendo à pergunta ou apresentando a ideia principal; não use longas introduções genéricas.
- Desenvolva a explicação com fatos e contexto, e encerre com uma síntese, uma implicação ou uma pergunta que convide à reflexão.
- **Parágrafos de até cinco linhas** no celular, ou cerca de 50 palavras. Bloco de dez linhas não é lido: é pulado.
- **Lista só quando os itens forem paralelos** e o leitor for compará-los. Lista de frases corridas é prosa disfarçada. Se o título anunciar “5”, entregue exatamente cinco.
- **Tabela só quando o conteúdo for tabular** — números, comparação de opções, datas. Fora disso, prosa.
- **Negrito com parcimônia:** no máximo uma expressão por parágrafo, para marcar o que o leitor não pode perder.
- Evite clickbait, repetição, enchimento, afirmações absolutas sem suporte e fórmulas vagas como “estudos comprovam” sem identificar os estudos.
- Não apresente uma ilustração conceitual como fotografia ou prova de um acontecimento real.

## Hierarquia de cabeçalhos

O título do post já vira o `H1` da página. No corpo, use `##` e `###`.

- **Acima de 300 palavras, pelo menos dois `##`.** Cada um abre um bloco de assunto, e o nome diz do que o trecho trata.
- **Abaixo de 300 palavras, subtítulo é opcional.** Uma sequência de parágrafos curtos lê melhor do que dois cabeçalhos espremidos.
- **`###` só dentro de um `##`**, nunca abrindo um bloco.
- **Nunca use `#` no corpo:** o `H1` é o título do post.
- O subtítulo não repete o título nem usa “Introdução”, “Conclusão” nem “Considerações finais”. Diga o assunto.

## Tamanho e leitura

Como referência, planeje aproximadamente **400 a 800 palavras**. A pauta pode ser menor ou maior quando o assunto justificar; clareza e completude vêm antes de atingir uma contagem.

## Título, resumo e tags

**Título** — vira o `H1` da página e a `Title Tag` do resultado de busca.

- Específico, fiel ao conteúdo e fácil de entender.
- **Até 60 caracteres.** Acima disso o buscador corta.
- A palavra-chave primária **no começo**. Pergunta funciona bem quando o artigo de fato a responde, e é a forma que mais se parece com a busca.
- Sem clickbait e sem dois-pontos seguidos de promessa vaga.

**Resumo (`excerpt`)** — vira a meta descrição exibida no resultado de busca.

- **Até 156 caracteres.** É o que o buscador mostra antes de cortar.
- Contém a palavra-chave, de forma natural.
- Antecipa a resposta e **não repete o título**. O título é o nome; o resumo é a propaganda.
- Uma ou duas frases, sem prometer o que o texto não entrega.

**Tags** — são os termos secundários.

- Poucas e relevantes, com o vocabulário do site.
- Evite tags redundantes, muito amplas ou sinônimos inventados para cobrir variações.

## Fechamento e chamada para ação

- O texto **encerra com uma síntese, uma implicação ou uma pergunta** que convide à reflexão — não com um resumo repetido.
- Depois do último parágrafo, o template já oferece “Na mesma linha” e “Leia também”. Não escreva chamada para o leitor continuar lendo: isso já acontece sozinho.
- **Não escreva “assine a newsletter”, “compartilhe” nem “deixe seu comentário”**: nenhum desses recursos existe no site. Chamada para o que não existe quebra a confiança.
- Se quiser provocar, prefira uma pergunta que o leitor possa responder de cabeça, não uma tarefa.

## Imagens e acessibilidade

- Cada post deve ter uma imagem de capa própria, alinhada ao tema e à direção visual do site.
- Ilustrações conceituais podem ser criadas com IA, desde que respeitem os termos da ferramenta e não imitem artistas, personagens, marcas ou obras específicas.
- Não use imagens geradas para simular registros documentais. Se uma imagem puder ser confundida com fotografia real, deixe claro que é ilustrativa e informe a origem quando necessário.
- Salve o arquivo em `public/images/posts/`, usando um nome descritivo, curto e sem espaços. Prefira formatos otimizados para web; comprima os arquivos e evite dimensões excessivas.
- Escreva `imageAlt` descrevendo o que a imagem mostra, e **inclua a palavra-chave quando ela descrever de fato a cena**. Não comece com “imagem de” nem empilhe termos que a ilustração não mostra.
- Confirme que o caminho informado no frontmatter corresponde ao arquivo existente.

## Metadados e estrutura do arquivo

Crie cada post como arquivo Markdown (`.md`), com nome curto, descritivo, em minúsculas e separado por hífens.

Modelo:

```yaml
---
title: "Título claro e específico"
excerpt: "Resumo breve do que o leitor encontrará."
keyword: "palavra-chave primária da busca"
section: "Papo de Boteco"
category: "curiosidades-de-boteco"
date: AAAA-MM-DD
tags: ["tema principal", "subtema"]
featured: false
image: "/images/posts/nome-descritivo.webp"
imageAlt: "Descrição objetiva da ilustração de capa"
sources:
  - label: "Instituição ou autor - título da fonte"
    url: "https://exemplo.com/referencia"
---

Introdução que responde à pergunta ou apresenta a ideia central.

Desenvolvimento com explicação, contexto e exemplos verificáveis.

Conclusão que sintetiza a ideia ou mostra por que ela importa.
```

**Não existe campo `readingTime`.** O tempo de leitura é calculado do corpo no build, com a régua de 200 palavras por minuto. Informar à mão só criava divergência: nos primeiros 25 posts, 24 anunciavam o dobro do tempo real.

**O campo `keyword`** registra a palavra-chave primária. Os 26 posts anteriores a esta revisão não têm e não precisam ter — o padrão vale para os novos. Ainda não é consumido pelo build: serve para o autor fixar o termo antes de escrever e para uma checagem automática futura.

**O campo `featured`** coloca o post no carrossel da home, à frente dos recentes. Use em poucos posts; se nenhum estiver marcado, o carrossel mostra os mais recentes.

**O campo `opiniao`** é para crônica e reflexão sem afirmação factual externa — o caso da Saideira. Marque `opiniao: true` nesses textos: a regra de duas fontes não se aplica a eles, e o verificador de fontes passa a mostrá-los como informação em vez de problema. Sem a marca, `npm run checar-fontes` acusa o post para sempre.

O campo `sources` deve conter apenas referências realmente consultadas e pertinentes. Quando o texto for uma reflexão original sem afirmações factuais externas, não invente fontes; o site não precisa exibir uma seção de fontes vazia.

## Revisão antes de publicar

Antes de marcar o post como pronto:

- A palavra-chave primária está definida e aparece no título, no `excerpt`, no `imageAlt` e no primeiro parágrafo?
- O título representa fielmente o texto e cabe em 60 caracteres?
- O resumo cabe em 156 caracteres, contém a palavra-chave e não repete o título?
- O artigo entrega o que promete e responde à pergunta central já no primeiro parágrafo?
- Acima de 300 palavras, o texto tem pelo menos dois `##`, e nenhum `###` abre bloco?
- Nenhum `#` no corpo do texto?
- Os parágrafos cabem em cinco linhas, e listas e tabelas aparecem só onde o conteúdo justifica?
- O fechamento sintetiza ou provoca, sem prometer recurso que o site não tem?
- As afirmações factuais têm fontes específicas, acessíveis e adequadas?
- Nomes, datas, números e títulos foram conferidos?
- A opinião está distinguível de fatos e conclusões de pesquisas?
- Há generalizações, promessas ou trechos vagos que devem ser corrigidos?
- Ortografia, acentuação, pontuação e leitura em voz alta foram revisadas?
- Categoria, data, tags e `keyword` estão corretos? (o tempo de leitura é calculado, não se informa)
- Imagem e `imageAlt` estão presentes e o arquivo existe?
- Links das fontes abrem o material citado?
- Se o texto é crônica ou reflexão, está marcado com `opiniao: true`?
- O slug preserva URLs existentes?

## Prompt para a imagem de capa

Depois de criar o post, forneça também um prompt para gerar a capa, seguindo o modelo abaixo:

----------

Create an original conceptual editorial illustration for a Brazilian culture and curiosity blog.

ARTICLE TOPIC: Why the sky appears blue
CORE IDEA TO COMMUNICATE: Sunlight scattering through Earth's atmosphere
KEY VISUAL ELEMENTS: A soft blue sky, a warm sun, and simple atmospheric layers

Visual direction:
- A warm, thoughtful, approachable editorial illustration — clearly illustrated, not photorealistic.
- Use a refined, simple composition with a few recognizable shapes and subtle visual storytelling.
- Soft, muted colors inspired by terracotta, warm cream, dusty blue, sage green, and mustard yellow. Choose only the colors that suit the subject.
- Gentle natural light, soft shadows, lightly textured shapes, and clean edges.
- Sophisticated but friendly, suitable for a contemporary independent blog.
- Make this image visually distinct from other article covers while keeping the same overall art direction.
- Wide landscape composition, 16:9 aspect ratio, suitable for a website article cover.
- Keep the main subject clear and comfortably inside the frame, with enough breathing room around it.
- The image must still read well when cropped slightly on different screen sizes.

Do not include any text, letters, numbers, logos, watermarks, borders, UI elements, or fake interface details. Do not imitate a specific artist, existing illustration, brand, copyrighted character, or recognizable artwork. Avoid photorealism, stock-photo aesthetics, visual clutter, overly saturated colors, and unrelated decorative objects.

Create one finished image only.


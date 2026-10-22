---
title: "Por que a internet precisou do IPv6?"
excerpt: "O IPv6 existe porque os endereços do IPv4 acabaram. Entenda a diferença entre os dois padrões e por que a transição ainda não terminou."
keyword: "IPv6"
section: "Mix de Variedades"
category: "mix-de-variedades"
date: 2026-10-17
tags: ["IPv6", "endereço IP", "IPv4", "internet"]
featured: false
image: "/images/posts/por-que-a-internet-precisou-do-ipv6.webp"
imageAlt: "Ilustração de um pequeno bloco de pontos ao lado de um campo muito maior e mais denso de pontos, representando a diferença de endereços entre IPv4 e IPv6."
sources:
  - label: "IETF - RFC 8200: Internet Protocol, Version 6 (IPv6) Specification"
    url: "https://www.rfc-editor.org/rfc/rfc8200"
  - label: "IANA - IPv4 Address Space Registry"
    url: "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml"
  - label: "NIC.br - Núcleo de Informação e Coordenação do Ponto BR"
    url: "https://www.nic.br/"
---

A internet precisou do IPv6 porque os endereços do padrão anterior, o IPv4, acabaram. Todo aparelho conectado precisa de um endereço IP para enviar e receber dados, e o IPv4 tem um espaço limitado: são 32 bits, o que dá cerca de 4,3 bilhões de combinações possíveis. Parece muito, mas não foi suficiente para a quantidade de celulares, computadores, servidores e sensores que existem hoje.

O IPv6 resolve isso mudando o tamanho do endereço. Em vez de 32 bits, ele usa 128 — um espaço de endereçamento que, na prática, dificilmente vai se esgotar.

## O que é um endereço IP e por que o IPv4 acabou

Um endereço IP funciona como o número de uma casa: é por ele que os dados sabem para onde ir. O IPv4 foi definido nos anos 1980, quando a rede tinha poucos milhares de computadores e ninguém previa que cada pessoa carregaria vários dispositivos conectados no bolso.

O esgotamento não aconteceu de uma vez. A IANA, entidade que coordena a distribuição dos endereços, entregou os últimos blocos disponíveis aos registros regionais em 2011. A partir daí, cada região passou a administrar o que tinha, e algumas adotaram regras mais rígidas para distribuir os endereços restantes.

O que segurou a internet foi uma gambiarra engenhosa: o NAT. Com ele, vários aparelhos de uma casa compartilham um único endereço público, e o roteador cuida de separar o tráfego internamente. Funciona, mas cria complicações, para acessar um dispositivo de fora, para jogos online, para chamadas de vídeo.

## O que muda com o IPv6

A diferença central é o tamanho do espaço de endereçamento. O IPv4 tem 2 elevado a 32 endereços possíveis. O IPv6 tem 2 elevado a 128, um número com 39 dígitos, grande o bastante para dar endereço a cada grão de areia do planeta, como se costuma dizer.

Na prática, isso permite que cada dispositivo tenha seu próprio endereço público, sem precisar do NAT. Também simplifica o roteamento e facilita a configuração automática de redes.

O IPv6 não é uma camada por cima do IPv4: é um protocolo novo, que convive com o antigo. Por isso a transição é gradual, os dois padrões rodam em paralelo, e um mesmo aparelho costuma ter os dois endereços.

## Por que a transição é lenta

Trocar a base da internet não é simples. Roteadores antigos não falam IPv6, sistemas internos de empresas foram escritos para IPv4, e equipes de TI precisam atualizar configurações, firewalls e monitoramento.

O resultado é uma adoção desigual. Provedores e operadoras de celular avançaram mais, porque têm redes grandes e renovam equipamentos com frequência. Já redes internas de empresas e serviços mais antigos ficaram para trás. No Brasil, o NIC.br acompanha essa adoção e publica medições periódicas.

Há também o custo invisível: enquanto os dois protocolos coexistem, tudo precisa funcionar nos dois. É como manter duas numerações de casas ao mesmo tempo na mesma cidade.

O IPv6 não é uma novidade recente, a especificação existe desde os anos 1990. O que mudou foi a urgência: com o IPv4 esgotado, cada novo dispositivo conectado depende de uma solução que já deveria ter virado padrão. A pergunta que fica é simples: quantos aparelhos na sua casa dividem o mesmo endereço agora mesmo?
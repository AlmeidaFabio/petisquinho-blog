# Mestres originais

Imagens em resolução original, guardadas **fora** do site publicado.

Esta pasta existe porque `scripts/prepare-deploy.mjs` converte tudo que está em
`docs/imgs` para WebP (qualidade 80, largura máxima 1600 px) e o deploy apaga o
arquivo original depois do upload. A conversão é lossy, então o mestre não
sobrevive ao pipeline.

## O que tem aqui

| Arquivo | Original | Derivado publicado |
| --- | --- | --- |
| `ceu-azul.jpg` | 2752×1536, 3,0 MB | `public/images/posts/ceu-azul.webp` — 1600×893, 103 KB |
| `cheiro-de-terra-molhada.jpg` | 1376×768, 997 KB | `public/images/posts/cheiro-de-terra-molhada.webp` — 1376×768, 173 KB |

Os dois chegaram a produção em JPEG porque foram colocados direto em
`public/images/posts`, pulando o pipeline. Foram convertidos em 14/10/2026 e os
originais ficaram aqui.

## Regras

- **Não** mova nada daqui para `docs/imgs`. O script reconverteria e apagaria.
- Use esta pasta quando o mestre tiver valor de reuso fora do blog: recorte
  diferente, formato vertical para Pinterest (1000×1500), impressão, reencode
  com outra qualidade.
- `ceu-azul.jpg` é o único com resolução acima do teto de 1600 px. Recortar
  1600×893 para 2:3 daria apenas 600×893 — abaixo do recomendado para um pin
  vertical. Por isso o mestre de 2752 px vale ser mantido.
- Para gerar o derivado a partir de um mestre daqui:

```powershell
# a partir da raiz do projeto (site/)
node -e "import('sharp').then(async ({default:s})=>{await s('docs/imgs-originais/ARQUIVO.jpg').resize({width:1600,withoutEnlargement:true}).webp({quality:80}).toFile('public/images/posts/ARQUIVO.webp')})"
```

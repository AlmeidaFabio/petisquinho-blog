import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
// Lista escrita pelo prepare-deploy com os arquivos da caixa de entrada que
// podem ser apagados depois de um upload bem-sucedido.
const manifestPath = path.join(projectRoot, '.deploy-pendentes.json');

const host = process.env.HOSTGATOR_HOST;
const tlsServername = process.env.HOSTGATOR_TLS_SERVERNAME;
const port = Number(process.env.HOSTGATOR_PORT || 21);
const user = process.env.HOSTGATOR_USER;
const password = process.env.HOSTGATOR_PASSWORD;
const remotePath = process.env.HOSTGATOR_REMOTE_PATH || '/public_html';

if (!host || !user || !password) {
  console.error('Credenciais ausentes. Defina HOSTGATOR_HOST, HOSTGATOR_USER e HOSTGATOR_PASSWORD antes de rodar o deploy.');
  console.error('Opcional: HOSTGATOR_PORT (padrão 21) e HOSTGATOR_REMOTE_PATH (padrão /public_html)');
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  console.error('Pasta dist não encontrada. Rode primeiro: npm run build');
  process.exit(1);
}

// Os assets sobem ANTES do HTML, e não junto.
//
// O CSS e o JS carregam hash de conteúdo no nome, então o HTML novo aponta para
// um arquivo que ainda não existe no servidor até o envio chegar nele. Subindo
// tudo de uma vez, a ordem é a do sistema de arquivos, e o HTML pode ir
// primeiro: nessa janela, um pedido do CSS recebe 404 e a Cloudflare guarda esse
// 404 — a página fica sem estilo por horas, mesmo com o arquivo já publicado.
// Foi o que aconteceu no deploy de 15/10/2026: o busca.DaQYGQm0.css respondeu
// 404 com cf-cache-status HIT por 4 horas, enquanto a mesma URL com um
// parâmetro qualquer devolvia 200 text/css.
//
// Com os assets primeiro, o HTML só aparece quando tudo que ele referencia já
// está lá. Torna o deploy quase atômico do ponto de vista do leitor.
const pastasDeAsset = ['_astro', 'images', 'og'];

// O servidor encerra a sessão depois de um certo volume de arquivos: em
// 28/10/2026 o envio morreu com ECONNRESET sempre na mesma altura, ~140
// arquivos depois, mesmo reconectando. Antes disso o envio ia inteiro numa
// conexão só, e o site passou a ter arquivos demais para isso.
//
// Agora cada sessão envia um lote curto e o envio RETOMA de onde parou, em vez
// de recomeçar. Se um arquivo falhar, a conexão é refeita e ele é tentado de
// novo; o que já subiu não é reenviado.
const ARQUIVOS_POR_SESSAO = 40;
const TENTATIVAS_POR_ARQUIVO = 4;
const ESPERA_ENTRE_TENTATIVAS = 2000;

let cliente = null;

function novoTempo(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function conectar() {
  const novo = new Client();
  novo.ftp.verbose = false;

  await novo.access({
    host,
    port,
    user,
    password,
    secure: true,
    ...(tlsServername ? { secureOptions: { servername: tlsServername } } : {})
  });

  await novo.ensureDir(remotePath);

  return novo;
}

async function fechar() {
  if (cliente) {
    cliente.close();
    cliente = null;
  }
}

/** Lista recursivamente os arquivos, em ordem estável, com o destino remoto. */
async function listarArquivos(dirLocal, dirRemoto) {
  const arquivos = [];
  let entradas;

  try {
    entradas = await fsPromises.readdir(dirLocal, { withFileTypes: true });
  } catch {
    return arquivos;
  }

  entradas.sort((a, b) => a.name.localeCompare(b.name));

  for (const entrada of entradas) {
    const local = path.join(dirLocal, entrada.name);
    const remoto = path.posix.join(dirRemoto, entrada.name);

    if (entrada.isDirectory()) {
      arquivos.push(...(await listarArquivos(local, remoto)));
    } else {
      arquivos.push({ local, remoto });
    }
  }

  return arquivos;
}

/** Monta o plano de envio: assets primeiro, depois HTML, feeds e .htaccess. */
async function montarPlano() {
  const plano = [];

  for (const pasta of pastasDeAsset) {
    const local = path.join(distDir, pasta);
    if (fs.existsSync(local)) {
      plano.push(...(await listarArquivos(local, path.posix.join(remotePath, pasta))));
    }
  }

  const entradas = await fsPromises.readdir(distDir, { withFileTypes: true });
  entradas.sort((a, b) => a.name.localeCompare(b.name));

  for (const entrada of entradas) {
    if (pastasDeAsset.includes(entrada.name)) continue;

    const local = path.join(distDir, entrada.name);
    const remoto = path.posix.join(remotePath, entrada.name);

    if (entrada.isDirectory()) {
      plano.push(...(await listarArquivos(local, remoto)));
    } else {
      plano.push({ local, remoto });
    }
  }

  return plano;
}

// Só depois do upload dar certo a caixa de entrada é esvaziada — e só do que o
// prepare-deploy realmente consumiu, listado no manifesto.
//
// Não apaga por pasta: a fila `docs/posts` esvazia inteira (é o que sai neste
// deploy), mas a sala de espera `docs/editing` só perde a capa que foi de fato
// usada, e não os rascunhos e capas de semanas seguintes.
async function esvaziarCaixaDeEntrada() {
  let consumidos = [];

  try {
    consumidos = JSON.parse(await fsPromises.readFile(manifestPath, 'utf8'));
  } catch {
    consumidos = [];
  }

  let apagados = 0;
  for (const arquivo of consumidos) {
    try {
      await fsPromises.unlink(arquivo);
      apagados += 1;
    } catch (erro) {
      console.warn(`  aviso: não consegui apagar ${arquivo} (${erro.code})`);
    }
  }

  await fsPromises.rm(manifestPath, { force: true });

  if (apagados > 0) {
    console.log(`Esvaziada a caixa de entrada: ${apagados} arquivo(s) removido(s) após o deploy.`);
  }
}

try {
  const plano = await montarPlano();
  console.log(`${plano.length} arquivo(s) para enviar.`);

  const pastasCriadas = new Set([remotePath]);
  let enviados = 0;
  let nestaSessao = 0;
  let falhasDoArquivo = 0;

  cliente = await conectar();
  console.log(`Conectado a ${host}:${port}, enviando...`);

  while (enviados < plano.length) {
    const { local, remoto } = plano[enviados];

    try {
      const pastaRemota = path.posix.dirname(remoto);
      if (!pastasCriadas.has(pastaRemota)) {
        await cliente.ensureDir(pastaRemota);
        pastasCriadas.add(pastaRemota);
      }

      await cliente.uploadFrom(local, remoto);

      enviados += 1;
      nestaSessao += 1;
      falhasDoArquivo = 0;

      if (enviados % 50 === 0 || enviados === plano.length) {
        console.log(`  ${enviados}/${plano.length} arquivos`);
      }

      if (nestaSessao >= ARQUIVOS_POR_SESSAO && enviados < plano.length) {
        await fechar();
        cliente = await conectar();
        nestaSessao = 0;
      }
    } catch (erro) {
      falhasDoArquivo += 1;
      const codigo = erro.code || erro.message;

      await fechar();

      if (falhasDoArquivo > TENTATIVAS_POR_ARQUIVO) {
        console.error(`  falhou ${remoto} depois de ${TENTATIVAS_POR_ARQUIVO} tentativas: ${codigo}`);
        throw erro;
      }

      console.warn(
        `  ${codigo} em ${path.basename(local)}; reconectando e retomando do arquivo ` +
        `${enviados + 1}/${plano.length} (tentativa ${falhasDoArquivo})`
      );

      await novoTempo(ESPERA_ENTRE_TENTATIVAS);
      cliente = await conectar();
      nestaSessao = 0;
    }
  }

  await fechar();

  console.log('  HTML, feeds e .htaccess enviados');

  await esvaziarCaixaDeEntrada();

  console.log('Deploy concluído com sucesso.');
} catch (error) {
  console.error('Falha no processo de deploy para HostGator.');
  console.error(error);
  await fechar();
  process.exit(1);
}

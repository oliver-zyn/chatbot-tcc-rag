import { appConfig } from '../config/app-config';

/**
 * Recursive Splitting Strategy com separadores estruturais
 *
 * Algoritmo:
 * 1. Divide o texto usando separadores estruturais (parágrafos, seções)
 * 2. Se algum chunk exceder o tamanho máximo, divide recursivamente
 * 3. Sem overlap artificial - mantém apenas a estrutura natural do documento
 *
 * @param input - Texto a ser dividido em chunks
 * @returns Array de chunks de texto
 */
export function generateChunks(input: string): string[] {
  const text = input.trim();
  const maxChunkSize = appConfig.chunking.maxChunkSize;
  const minChunkSize = appConfig.chunking.minChunkSize;

  // Separadores em ordem de prioridade (do mais específico para o menos)
  const separators = [
    '\n\n',    // Quebras duplas (parágrafos) - principal separador
    '\n',      // Quebras simples (linhas)
    '. ',      // Fim de sentença
    '! ',      // Fim de sentença (exclamação)
    '? ',      // Fim de sentença (pergunta)
    '; ',      // Ponto e vírgula
    ', ',      // Vírgula
    ' ',       // Espaço (último recurso)
  ];

  function recursiveSplit(text: string, separatorIndex: number = 0): string[] {
    // Se o texto já está no tamanho ideal, retorna
    if (text.length <= maxChunkSize) {
      return [text];
    }

    // Se já esgotou todos os separadores, força divisão
    if (separatorIndex >= separators.length) {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += maxChunkSize) {
        chunks.push(text.slice(i, i + maxChunkSize));
      }
      return chunks;
    }

    const separator = separators[separatorIndex];
    const splits = text.split(separator);

    const chunks: string[] = [];
    let currentChunk = '';

    for (let i = 0; i < splits.length; i++) {
      const segment = splits[i];

      // Ignora segmentos vazios
      if (!segment.trim()) continue;

      // Se o segmento sozinho já é muito grande, divide recursivamente
      if (segment.length > maxChunkSize) {
        // Salva o chunk atual se existir
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // Divide recursivamente usando o próximo separador
        const subChunks = recursiveSplit(segment, separatorIndex + 1);
        chunks.push(...subChunks);
        continue;
      }

      // Tenta adicionar o segmento ao chunk atual
      const potentialChunk = currentChunk
        ? currentChunk + separator + segment
        : segment;

      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk;
      } else {
        // Chunk atual está completo, salva e inicia novo
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = segment;
      }
    }

    // Adiciona o último chunk se não estiver vazio
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Gera chunks sem overlap artificial
  let chunks = recursiveSplit(text);

  // Mescla chunks muito pequenos com o anterior
  const finalChunks: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (chunk.length < minChunkSize && finalChunks.length > 0) {
      // Mescla com o chunk anterior
      finalChunks[finalChunks.length - 1] += '\n\n' + chunk;
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks.filter(chunk => chunk.trim().length >= minChunkSize);
}

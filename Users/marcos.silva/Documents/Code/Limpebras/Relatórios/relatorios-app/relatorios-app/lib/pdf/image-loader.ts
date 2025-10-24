import fs from 'fs';
import path from 'path';

/**
 * Carrega uma imagem do diretório public e converte para base64
 * @param imagePath - Caminho da imagem relativo ao diretório public
 * @returns String base64 da imagem ou string vazia em caso de erro
 */
function loadImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64 = imageBuffer.toString('base64');
    const extension = path.extname(imagePath).slice(1);
    return `data:image/${extension};base64,${base64}`;
  } catch (error) {
    console.error(`Erro ao carregar imagem ${imagePath}:`, error);
    return '';
  }
}

/**
 * Retorna URLs base64 das imagens utilizadas nos PDFs
 * @returns Objeto com as imagens em formato base64
 */
export function getImageUrls() {
  return {
    cover: loadImageAsBase64('imgs/cover.png'),
    logo: loadImageAsBase64('imgs/logo.png'),
    line: loadImageAsBase64('imgs/line.png'),
    prefeitura: loadImageAsBase64('imgs/prefeitura.png'),
    info156: loadImageAsBase64('imgs/156.png')
  };
}

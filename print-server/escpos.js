// Comandos ESC/POS construídos à mão — sem dependências nativas (node-usb/escpos),
// para correr sem problemas de compilação na Raspberry Pi (ARM).

export const ESC = 0x1b
export const GS = 0x1d

export const INIT = Buffer.from([ESC, 0x40]) // ESC @
export const FEED = (linhas = 1) => Buffer.from([ESC, 0x64, linhas]) // ESC d n

export const ALIGN = {
  esquerda: Buffer.from([ESC, 0x61, 0x00]),
  centro: Buffer.from([ESC, 0x61, 0x01]),
  direita: Buffer.from([ESC, 0x61, 0x02]),
}

export const BOLD_ON = Buffer.from([ESC, 0x45, 0x01])
export const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00])

export const SIZE_NORMAL = Buffer.from([GS, 0x21, 0x00])
export const SIZE_DUPLO = Buffer.from([GS, 0x21, 0x11]) // largura + altura x2

const LARGURA_LINHA = 32 // colunas úteis a 58mm em fonte normal (203dpi)

// A maioria das mini impressoras térmicas (incl. clones GOOJPRT) não tem code page
// portuguesa fiável por defeito — em vez de arriscar caracteres trocados, removemos
// acentos para garantir que o talão sai sempre legível.
export function semAcentos(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function quebrarLinhas(str, largura = LARGURA_LINHA) {
  const texto = semAcentos(str)
  const palavras = texto.split(/\s+/).filter(Boolean)
  const linhas = []
  let atual = ''

  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (tentativa.length > largura) {
      if (atual) linhas.push(atual)
      atual = palavra
    } else {
      atual = tentativa
    }
  }
  if (atual) linhas.push(atual)
  return linhas.length ? linhas : ['']
}

export function linha(str = '') {
  return Buffer.from(`${semAcentos(str)}\n`, 'ascii')
}

export function separador(char = '-', largura = LARGURA_LINHA) {
  return linha(char.repeat(largura))
}

export { LARGURA_LINHA }

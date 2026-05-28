function primeiroTextoValido(...valores: unknown[]) {
  for (const valor of valores) {
    if (typeof valor === 'string' && valor.trim()) return valor.trim()
  }
  return ''
}

export function obterDiaEmenta(item: Record<string, unknown> | null | undefined) {
  return primeiroTextoValido(
    item?.data,
    item?.dia_semana,
    item?.dia,
    item?.nome_dia
  )
}

export function obterPratoEmenta(item: Record<string, unknown> | null | undefined) {
  const linhas: string[] = []

  const carne = primeiroTextoValido(item?.carne)
  const peixe = primeiroTextoValido(item?.peixe)
  const vegetariano = primeiroTextoValido(item?.vegetariano)

  if (carne) linhas.push(`Carne: ${carne}`)
  if (peixe) linhas.push(`Peixe: ${peixe}`)
  if (vegetariano) linhas.push(`Vegetariano: ${vegetariano}`)

  if (linhas.length > 0) return linhas.join('\n')

  return (
    primeiroTextoValido(
      item?.prato,
      item?.nome_prato,
      item?.prato_nome,
      item?.refeicao,
      item?.menu,
      item?.titulo,
      item?.descricao
    ) || 'Sem prato definido'
  )
}

export function obterImagemEmenta(item: Record<string, unknown> | null | undefined) {
  return primeiroTextoValido(
    item?.foto_url,
    item?.imagem_url,
    item?.imagem,
    item?.foto
  )
}

const MESES_PT: Record<string, number> = {
  jan: 0,
  janeiro: 0,
  fev: 1,
  fevereiro: 1,
  mar: 2,
  marco: 2,
  março: 2,
  abr: 3,
  abril: 3,
  mai: 4,
  maio: 4,
  jun: 5,
  junho: 5,
  jul: 6,
  julho: 6,
  ago: 7,
  agosto: 7,
  set: 8,
  setembro: 8,
  out: 9,
  outubro: 9,
  nov: 10,
  novembro: 10,
  dez: 11,
  dezembro: 11,
}

function paraIsoLocal(ano: number, mes: number, dia: number) {
  const mesFormatado = String(mes + 1).padStart(2, '0')
  const diaFormatado = String(dia).padStart(2, '0')
  return `${ano}-${mesFormatado}-${diaFormatado}`
}

export function parseDataEmentaParaISO(texto: string, referencia = new Date()): string | null {
  const valor = texto.trim()
  if (!valor) return null

  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return valor.slice(0, 10)
  }

  const match = valor.match(/(\d{1,2})\s+(?:de\s+)?([A-Za-zÀ-ÿ]+)/i)
  if (!match) return null

  const dia = Number.parseInt(match[1], 10)
  const mesTexto = match[2].toLowerCase()
  const mes =
    MESES_PT[mesTexto] ??
    MESES_PT[mesTexto.slice(0, 3)] ??
    MESES_PT[mesTexto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')]

  if (mes === undefined || Number.isNaN(dia)) return null

  const hoje = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate())
  let ano = referencia.getFullYear()
  let data = new Date(ano, mes, dia)

  if (data < hoje && mes < hoje.getMonth()) {
    ano += 1
    data = new Date(ano, mes, dia)
  }

  return paraIsoLocal(ano, mes, dia)
}

export type DiaReservavel = {
  iso: string
  dia: number
  mesLabel: string
  rotulo: string
}

export function obterDiasReservaveisComEmenta(ementas: unknown[]): DiaReservavel[] {
  const hoje = new Date()
  const hojeInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const porData = new Map<string, DiaReservavel>()

  for (const item of ementas) {
    if (!item || typeof item !== 'object') continue
    const registo = item as Record<string, unknown>

    const textos = [registo.data, registo.data_ementa, registo.dia, registo.dia_semana].filter(
      (v): v is string => typeof v === 'string' && v.trim().length > 0
    )

    for (const texto of textos) {
      const iso = parseDataEmentaParaISO(texto, hoje)
      if (!iso) continue

      const data = new Date(`${iso}T12:00:00`)
      if (data < hojeInicio) continue

      if (!porData.has(iso)) {
        porData.set(iso, {
          iso,
          dia: data.getDate(),
          mesLabel: data.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '').toUpperCase(),
          rotulo: obterDiaEmenta(registo) || texto,
        })
      }
    }
  }

  return Array.from(porData.values()).sort((a, b) => a.iso.localeCompare(b.iso))
}

export function formatarDataEmenta(item: Record<string, unknown> | null | undefined) {
  const candidatos = [item?.data_ementa, item?.created_at]

  for (const valor of candidatos) {
    if (typeof valor !== 'string' || !valor.trim()) continue
    const data = new Date(valor)
    if (!Number.isNaN(data.getTime())) {
      return data.toLocaleDateString('pt-PT')
    }
  }

  return ''
}

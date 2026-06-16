import express from 'express'
import cors from 'cors'
import {
  INIT,
  FEED,
  ALIGN,
  BOLD_ON,
  BOLD_OFF,
  SIZE_NORMAL,
  SIZE_DUPLO,
  linha,
  separador,
} from './escpos.js'
import { impressoraDisponivel, enviarParaImpressora } from './usbPrinter.js'
import { digitarTexto, apagarCaractere } from './tecladoSistema.js'

const PORT = Number(process.env.PORT) || 9100

const ORIGEM_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

const app = express()
app.use(express.json())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ORIGEM_LOCAL.test(origin)) return callback(null, true)
      callback(new Error('Origem não permitida'))
    },
  })
)

function construirTalao({ tipo, prato, data, valor, pin, estado, aluno }) {
  const partes = [
    INIT,
    ALIGN.centro,
    BOLD_ON,
    SIZE_DUPLO,
    linha('EPBJC'),
    SIZE_NORMAL,
    BOLD_OFF,
    linha('Cantina Escolar'),
    separador(),
    ALIGN.esquerda,
    linha(`Aluno: ${aluno}`),
    linha(`Prato: ${prato}`),
    linha(`Data: ${data}`),
    linha(`Valor: ${Number(valor).toFixed(2)} EUR`),
  ]

  if (tipo === 'reserva' && estado) {
    partes.push(linha(`Estado: ${estado}`))
  }

  if (tipo === 'consumo' && pin) {
    partes.push(separador(), ALIGN.centro, BOLD_ON, SIZE_DUPLO, linha(`PIN: ${pin}`), SIZE_NORMAL, BOLD_OFF)
  }

  partes.push(
    ALIGN.centro,
    separador(),
    linha(`Impresso em: ${new Date().toLocaleString('pt-PT')}`),
    FEED(4)
  )

  return Buffer.concat(partes)
}

app.get('/status', (_req, res) => {
  res.json({ ok: impressoraDisponivel() })
})

app.post('/imprimir', async (req, res) => {
  const { tipo, prato, data, valor, pin, estado, aluno } = req.body ?? {}

  if (!tipo || !prato || !data || valor == null || !aluno) {
    return res.status(400).json({ error: 'Faltam campos obrigatórios (tipo, prato, data, valor, aluno).' })
  }

  try {
    const talao = construirTalao({ tipo, prato, data, valor, pin, estado, aluno })
    await enviarParaImpressora(talao)
    res.json({ ok: true })
  } catch (err) {
    console.error('Erro ao imprimir:', err)
    res.status(500).json({ error: err.message || 'Não foi possível imprimir a fatura.' })
  }
})

app.post('/tecla', async (req, res) => {
  const { acao, texto } = req.body ?? {}

  try {
    if (acao === 'inserir') {
      if (!texto) return res.status(400).json({ error: 'Falta o texto a inserir.' })
      await digitarTexto(texto)
    } else if (acao === 'apagar') {
      await apagarCaractere()
    } else {
      return res.status(400).json({ error: 'Ação desconhecida (usa "inserir" ou "apagar").' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('Erro ao simular tecla:', err)
    res.status(500).json({ error: 'Não foi possível simular a tecla.' })
  }
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`print-server a correr em http://127.0.0.1:${PORT}`)
})

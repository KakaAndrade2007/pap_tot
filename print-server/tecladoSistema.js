// Simula teclas físicas a nível do sistema operativo via `wtype` (protocolo
// virtual-keyboard do Wayland). Usado só para o campo de cartão da Stripe, que
// vive num iframe protegido e não pode ser escrito por JavaScript da nossa página.
import { execFile } from 'node:child_process'

function executar(args) {
  return new Promise((resolve, reject) => {
    execFile('wtype', args, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export function digitarTexto(texto) {
  return executar([texto])
}

export function apagarCaractere() {
  return executar(['-k', 'BackSpace'])
}

// Comunicação direta por USB (libusb) com a GOOJPRT PT-210.
//
// Esta impressora usa um chip genérico YICHIP que se identifica como "POS58 Printer"
// (classe USB Printer, mas o driver de kernel usblp falha o probe nela — fica sem
// associar a /dev/usb/lp0). Em vez de depender do usblp, falamos diretamente com o
// endpoint USB via o pacote "usb" (bindings libusb).
import usbPkg from 'usb'

const { findByIds } = usbPkg

const VID = Number(process.env.PRINTER_VID) || 0x0fe6
const PID = Number(process.env.PRINTER_PID) || 0x811e

export function impressoraDisponivel() {
  return Boolean(findByIds(VID, PID))
}

export function enviarParaImpressora(buffer) {
  return new Promise((resolve, reject) => {
    const device = findByIds(VID, PID)
    if (!device) {
      reject(new Error('Impressora não encontrada (verifica o cabo USB e se está ligada).'))
      return
    }

    try {
      device.open()
    } catch (err) {
      reject(new Error(`Não foi possível abrir a impressora: ${err.message}`))
      return
    }

    const iface = device.interfaces[0]
    try {
      iface.claim()
    } catch (err) {
      device.close()
      reject(new Error(`Não foi possível reservar a interface USB: ${err.message}`))
      return
    }

    const outEp = iface.endpoints.find((e) => e.direction === 'out')
    if (!outEp) {
      iface.release(true, () => device.close())
      reject(new Error('A impressora não tem endpoint de saída USB.'))
      return
    }

    outEp.transfer(buffer, (err) => {
      iface.release(true, () => {
        device.close()
        if (err) reject(err)
        else resolve()
      })
    })
  })
}

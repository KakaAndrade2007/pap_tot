# Deploy na Raspberry Pi 5 (totem + impressora GOOJPRT PT-210)

## 1. Transferir o código
```bash
rsync -avz --exclude node_modules --exclude dist /Users/mattmurdock/Documents/pap_tot/ pi@<ip-da-pi>:/home/pi/pap_tot/
scp /Users/mattmurdock/Documents/pap_tot/.env pi@<ip-da-pi>:/home/pi/pap_tot/.env
```

## 2. Instalar Node.js (se ainda não estiver na Pi)
```bash
ssh pi@<ip-da-pi>
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs chromium-browser unclutter
```

## 3. Build da app web
```bash
cd /home/pi/pap_tot
npm install
npm run build
```

## 4. Print-server
```bash
cd /home/pi/pap_tot/print-server
sudo apt-get install -y libusb-1.0-0-dev   # runtime/headers para o pacote npm "usb"
npm install
```
A GOOJPRT PT-210 (chip YICHIP, aparece como "POS58 Printer") **não é reconhecida pelo
driver de kernel `usblp`** — o probe falha com EIO. Por isso o print-server fala
diretamente com o dispositivo via libusb (pacote `usb`), sem passar por `/dev/usb/lp0`.

## 5. Identificar a impressora e dar permissões
```bash
# com a PT-210 ligada por USB e LIGADA (botão de power):
lsusb                       # confirma o ID 0fe6:811e (ou outro, conforme a unidade)
```
Se o vendor/product for diferente do que está em `deploy/99-pos-printer.rules`, ajusta
o ficheiro. Depois:
```bash
sudo cp deploy/99-pos-printer.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules && sudo udevadm trigger
```
Nota: estas impressoras portáteis têm bateria interna e a porta USB da Pi pode não dar
corrente suficiente — se ela desligar sozinha a meio (ouve-se um "clique"), carrega-a
primeiro com o carregador original antes de testar.

## 6. Serviços systemd (arrancam sozinhos no boot)
```bash
sudo cp deploy/pap-tot-web.service deploy/pap-tot-print.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pap-tot-web pap-tot-print
sudo systemctl status pap-tot-web pap-tot-print
```

## 7. Modo kiosk (Chromium em fullscreen no arranque)
```bash
mkdir -p ~/.config/autostart
cp deploy/pap-tot-kiosk.desktop ~/.config/autostart/
# desativar blanking do ecrã:
echo "@xset s off" >> ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null || true
echo "@xset -dpms" >> ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null || true
echo "@unclutter -idle 0" >> ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null || true
```
(Em Raspberry Pi OS Bookworm com Wayland/labwc, o equivalente é editar
`~/.config/wayfire.ini` ou `~/.config/labwc/autostart` — adapta conforme a versão instalada.)

## 8. Testar
```bash
curl -X POST http://127.0.0.1:9100/imprimir -H 'Content-Type: application/json' \
  -d '{"tipo":"consumo","prato":"Carne","data":"28/05/2026","valor":2.5,"pin":"6301","aluno":"Teste"}'
sudo reboot   # confirma que tudo arranca sozinho: kiosk + os dois serviços
```

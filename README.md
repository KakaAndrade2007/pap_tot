[README (1).md](https://github.com/user-attachments/files/32336862/README.1.md)
<div align="center">

# 🍽️ KlikaAqui · Totem

**Quiosque de autoatendimento para a cantina escolar da EPBJC**

Reserva de refeições, carregamento de saldo e impressão de talões, num totem com ecrã tátil em Raspberry Pi 5.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Pagamentos-635BFF?logo=stripe&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi_5-Kiosk-A22846?logo=raspberrypi&logoColor=white)

*Projeto de PAP (Prova de Aptidão Profissional) do curso de Programação e Gestão de Sistemas Informáticos, Escola Profissional Bento de Jesus Caraça.*

</div>

---

## 📖 Sobre o projeto

O **KlikaAqui Totem** substitui as senhas em papel da cantina por um quiosque tátil. Alunos, professores e funcionários entram com a sua conta, consultam a ementa, reservam o almoço, carregam saldo com cartão e imprimem o talão com o PIN da refeição, tudo no próprio totem.

A aplicação corre em modo kiosk (Chromium em ecrã inteiro) numa **Raspberry Pi 5**, ligada a uma **impressora térmica GOOJPRT PT-210** através de um pequeno servidor local em Node.js.

## ✨ Funcionalidades

### 👤 Contas
- Seleção do perfil: **Aluno**, **Professor**, **Funcionário** ou **Outros**
- Registo e login com palavra-passe encriptada (bcrypt)
- Saldo inicial atribuído no registo

### 🍛 Refeições
- Ementa do dia e ementas da semana, com imagem de cada prato
- Calendário para escolher o dia da refeição
- Reserva de prato (**Carne**, **Peixe** ou **Vegetariano**) com débito automático do saldo
- Atalho **"Comprar hoje"** para a refeição do próprio dia
- Proteção contra reservas duplicadas no mesmo dia
- PIN de 4 dígitos gerado para cada refeição

### 💳 Pagamentos
- Carregamento de saldo em valores fixos (5 €, 10 €, 20 €, 50 €)
- Pagamento com cartão via **Stripe**
- Opção MB WAY na interface (em preparação)

### 🧾 Faturas e talões
- Histórico de refeições com filtros e paginação
- Impressão do talão na impressora térmica (aluno, prato, data, valor e PIN)
- Envio de e-mail com o comprovativo de cada reserva e de cada carregamento

### 📰 Outros
- Notícias da escola, com destaques na página inicial
- Formulário de suporte que envia o pedido por e-mail
- **Teclado virtual** próprio, com acentos portugueses, para uso sem teclado físico
- Ecrã de boas-vindas (splash) para o modo quiosque

## 🏗️ Arquitetura

```
┌──────────────────────── Raspberry Pi 5 ────────────────────────┐
│                                                                │
│  Chromium (kiosk)  ──►  App React (vite preview :4173)         │
│                              │                                 │
│                              ├──►  Print-server (Express :9100)│
│                              │        ├── ESC/POS via libusb ──┼──► GOOJPRT PT-210
│                              │        └── Teclado (wtype)      │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
                 ┌────────── Supabase ──────────┐
                 │  PostgreSQL                  │
                 │  Edge Functions ──► Stripe   │
                 │                 ──► Brevo    │
                 └──────────────────────────────┘
```

## 🧰 Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, TypeScript, Vite, Lucide Icons |
| Backend | Supabase (PostgreSQL, Edge Functions em Deno) |
| Pagamentos | Stripe (`@stripe/react-stripe-js`) |
| E-mail | Brevo (API transacional) |
| Autenticação | bcryptjs |
| Hardware | Raspberry Pi 5, ecrã tátil, impressora térmica GOOJPRT PT-210 |
| Print-server | Node.js, Express, `usb` (libusb), comandos ESC/POS |
| Deploy | systemd, udev, Chromium em modo kiosk |

## 📁 Estrutura do projeto

```
pap_tot/
├── src/
│   ├── App.tsx                  # Fluxo principal (splash → perfil → login → dashboard)
│   ├── components/
│   │   ├── SplashScreen.tsx
│   │   ├── CategorySelector.tsx # Escolha do perfil
│   │   ├── Login.tsx / Register.tsx
│   │   ├── TecladoVirtual.tsx   # Teclado no ecrã
│   │   ├── Dashboard.tsx        # Menu lateral e navegação
│   │   └── dashboard/           # Home, Ementas, Calendário, Faturas,
│   │                            # Pagamento, Notícias, Suporte
│   ├── services/                # Supabase, reservas, ementas, notícias,
│   │                            # impressora, teclado do sistema
│   ├── contexts/                # Estado do teclado virtual
│   └── lib/                     # Stripe e formatação de ementas
├── supabase/functions/
│   ├── processar-pagamento/     # Cria o PaymentIntent na Stripe
│   ├── notificar-reserva/       # E-mail de confirmação da reserva
│   ├── notificar-carregamento/  # E-mail de carregamento de saldo
│   └── enviar-suporte/          # E-mail de pedido de suporte
├── print-server/                # Ponte local para a impressora e o teclado
└── deploy/                      # Serviços systemd, regra udev e kiosk
```

## 🗄️ Base de dados (Supabase)

| Tabela | Conteúdo |
|---|---|
| `perfis` | Nome, identificador, e-mail, hash da palavra-passe, tipo de perfil, saldo |
| `historico_almocos` | Prato, data da refeição, valor, PIN, data da compra |
| `ementas` | Pratos por dia, com imagem |
| `noticias` | Notícias da escola e destaques |

## 🚀 Como executar

### Pré-requisitos
- Node.js 20+
- Um projeto no [Supabase](https://supabase.com)
- Uma conta [Stripe](https://stripe.com) (modo de teste serve)
- Uma chave de API da [Brevo](https://www.brevo.com) para os e-mails

### 1. Instalar

```bash
git clone https://github.com/KakaAndrade2007/pap_tot.git
cd pap_tot
npm install
```

### 2. Variáveis de ambiente

Cria um ficheiro `.env` na raiz:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PRINTER_URL=http://localhost:9100
```

### 3. Edge Functions

```bash
npx supabase login
npx supabase link --project-ref <id-do-projeto>

npx supabase secrets set STRIPE_SECRET_KEY=sk_test_... BREVO_API_KEY=...

npx supabase functions deploy processar-pagamento
npx supabase functions deploy notificar-reserva
npx supabase functions deploy notificar-carregamento
npx supabase functions deploy enviar-suporte
```

### 4. Correr em desenvolvimento

```bash
npm run dev
```

A app abre em **http://localhost:5173**. Sem a impressora ligada, tudo funciona exceto a impressão de talões.

### 5. Print-server (opcional em desenvolvimento)

```bash
cd print-server
npm install
npm start
```

Endpoints disponíveis em `http://localhost:9100`:

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/status` | Indica se a impressora está disponível |
| `POST` | `/imprimir` | Imprime um talão |
| `POST` | `/tecla` | Simula teclas no sistema (para o campo de cartão da Stripe) |

## 🍓 Instalação na Raspberry Pi

O guia completo está em [`deploy/README.md`](deploy/README.md). Em resumo:

1. Copiar o projeto e o `.env` para a Pi
2. Instalar Node.js, Chromium e `libusb-1.0-0-dev`
3. `npm run build` na app e `npm install` no print-server
4. Instalar a regra udev da impressora (`deploy/99-pos-printer.rules`)
5. Ativar os serviços `pap-tot-web` e `pap-tot-print` no systemd
6. Adicionar `pap-tot-kiosk.desktop` ao arranque automático

> 💡 A PT-210 não funciona com o driver `usblp` do kernel, por isso o print-server comunica com ela diretamente por libusb.

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verificação de tipos e build de produção |
| `npm run preview` | Serve o build (usado no totem) |
| `npm run lint` | ESLint |

## 👨‍💻 Autores

Desenvolvido por **Kaique** ([@KakaAndrade2007](https://github.com/KakaAndrade2007)) e **Kauã**.

---

<div align="center">
Escola Profissional Bento de Jesus Caraça · PAP 2026
</div>

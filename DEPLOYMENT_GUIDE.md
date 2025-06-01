# FiloSign ‑ Deployment Guide  
*(feature branch: `factory-branch-simple-storage-using-pdp-pdptool-and-payments-contract`)*

---

## Table of Contents
1. Prerequisites  
2. Environment Variables  
3. Local Development ‑ Port 3003  
4. Production Build (local)  
5. Vercel Deployment  
6. Switching Between Mock & PDP Modes  
7. Troubleshooting FAQ  

---

## 1. Prerequisites

| Tool | Min Version | Used for |
|------|-------------|----------|
| **Node.js** | 20.x | Next.js runtime & tooling |
| **npm** | 9.x | package manager |
| **Git** | any recent | branch checkout / pushes |
| **MetaMask** | latest | PDP mode wallet txs |
| **Web3.Storage account** | free tier OK | PDP uploads |
| **Vercel account** | free | cloud deployment |

---

## 2. Environment Variables

Create `.env.local` (ignored by Git).  
Minimal template:

```
######## MODE TOGGLE ########
# true  = PDP / Filecoin
# false = Mock (localStorage)
NEXT_PUBLIC_STORAGE_V2=true

######## Web3.Storage ########
WEB3_STORAGE_TOKEN=<your_w3s_token>

######## PDP CONTRACTS ########
NEXT_PUBLIC_PDP_CONTRACT_ADDRESS_MAINNET=0x...
NEXT_PUBLIC_PDP_CONTRACT_ADDRESS_TESTNET=0x...
NEXT_PUBLIC_CHAIN_ID=5                   # 5 = Goerli
NEXT_PUBLIC_RPC_URL=https://ethereum-goerli.publicnode.com

######## FILECOIN ########
NEXT_PUBLIC_FILECOIN_SP_ID=f01234
NEXT_PUBLIC_FILECOIN_API_URL=https://api.hyperspace.node.glif.io/rpc/v1

######## PAYMENTS ########
NEXT_PUBLIC_DEFAULT_PAYMENT_AMOUNT=0.1
NEXT_PUBLIC_GAS_PRICE_MULTIPLIER=1.2

######## DEV SETTINGS ########
LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_MOCK_WALLET=false
PORT=3003                 # custom dev port
NEXT_TELEMETRY_DISABLED=1 # disable Next.js telemetry
```

> 🔒 **Never** commit real tokens / keys.

---

## 3. Local Development (port 3003)

```bash
git clone https://github.com/timfong888/filosign.git
cd filosign/filosign-app

npm install          # first-time deps
npm run dev          # uses PORT from .env.local (3003)

# open http://localhost:3003
```

During first launch Next.js builds Tailwind & pages.  
Console should show:

```
ready - Local    http://localhost:3003
```

### Hot-reload
Any file change triggers automatic reload.

### Common local tasks

| Action | Command |
|--------|---------|
| Jest unit tests | `npm test` |
| Coverage report | `npm run test:coverage` |
| Lint (optional) | `npm run lint` |

---

## 4. Production Build (local)

Good for verifying a Vercel-like build:

```bash
npm run build
npm start          # serves optimized build at http://localhost:3003
```

If ESLint stops the build you can bypass via:

```bash
NEXTJS_IGNORE_ESLINT=1 npm run build
```

(Already configured in `next.config.ts` to ignore during CI builds.)

---

## 5. Deploy to Vercel

### 5.1 Via Vercel Dashboard

1. **Import Project**  
   - Select your GitHub repo  
   - Choose **branch**:  
     `factory-branch-simple-storage-using-pdp-pdptool-and-payments-contract`

2. **Environment Variables**  
   - Add **all** vars from `.env.local` (without `PORT`)  
   - Store `WEB3_STORAGE_TOKEN` as **Secret**  

3. **Build & Output**  
   - Build Command: `npm run build` (default)  
   - Output Dir: `.next` (auto)  

4. **Deploy** – Vercel spins up preview URL.

### 5.2 Via Vercel CLI

```bash
npm i -g vercel
vercel link                          # one-time
vercel env pull .env.vercel.local    # optional
vercel --prod --branch=factory-branch-simple-storage-using-pdp-pdptool-and-payments-contract
```

> Feature flag: keep `NEXT_PUBLIC_STORAGE_V2=false` on `main`.  
> Deploy previews with flag **true**; flip when confident.

---

## 6. Switching Between Mock & PDP

| Mode | Flag | Wallet needed | Storage |
|------|------|---------------|---------|
| **Mock** | `NEXT_PUBLIC_STORAGE_V2=false` | ❌ | Browser localStorage |
| **PDP**  | `NEXT_PUBLIC_STORAGE_V2=true`  | ✅ MetaMask | Filecoin via web3.storage |

Change the flag, restart server (`Ctrl-C`, `npm run dev`).

---

## 7. Troubleshooting FAQ

| Symptom | Cause / Fix |
|---------|-------------|
| `Module not found: pino-pretty` during build | Warning only – ignore or `npm i pino-pretty -D` |
| Browser shows “MetaMask not detected” | Install MetaMask **or** set `NEXT_PUBLIC_ENABLE_MOCK_WALLET=true` |
| Progress stalls at **uploading 0 %** | Invalid `WEB3_STORAGE_TOKEN` or poor network |
| Tx rejected / “User denied” | User cancelled in MetaMask – retry |
| `FILE_TOO_LARGE` error | File exceeds provider limit (10 GB demo). Compress/split |
| Build fails ESLint errors | Already disabled in `next.config.ts`; if custom rules added, set `eslint.ignoreDuringBuilds=true` |

---

### Need Help?
Open an issue or ping the dev channel!  
Happy signing & storing with Filecoin 🚀

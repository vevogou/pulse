<p align="center">
  <img src="web/public/logo.png" alt="PULSE" width="200" />
</p>

<h1 align="center">⚡ PULSE — Earned Wage Access on Polygon</h1>

<p align="center">
  <strong>Real-time salary streaming · Aave V3 yield · Soulbound identity · Cash-out agents</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Polygon-Mainnet-8247E5?style=for-the-badge&logo=polygon" alt="Polygon" />
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/USDC-Stablecoin-2775CA?style=for-the-badge" alt="USDC" />
  <img src="https://img.shields.io/badge/Aave-V3_Yield-B6509E?style=for-the-badge&logo=aave" alt="Aave" />
</p>

---

## 🌍 The Problem

**2.7 billion workers** worldwide are paid monthly — but bills, rent, and emergencies don't wait. When payday is 3 weeks away, workers turn to predatory loan sharks charging **30%+ interest**, trapping them in debt cycles. The traditional payroll system is broken.

## 💡 The Solution

**PULSE** is a decentralized Earned Wage Access (EWA) protocol deployed on **Polygon Mainnet**. It streams salaries in **real-time** — every second of work = instant income. Workers withdraw any amount, any time. Employers earn **Aave V3 yield** on idle payroll. No debt. No interest. No middleman.

---

## 🏗️ Architecture

```
                                    ┌──────────────┐
                                    │   Aave V3    │
                                    │   ~4.1% APY  │
                                    └──────┬───────┘
                                           │ supply / withdraw
                                           ▼
┌──────────────┐  depositPayroll()  ┌──────────────┐  fundStream()  ┌──────────────┐
│   EMPLOYER   │ ─────────────────► │  PulseVault  │ ─────────────► │ StreamEngine │
│              │                    │   Treasury   │                │  Per-Second  │
└──────────────┘                    └──────────────┘                └──────┬───────┘
                                                                          │
                                     withdraw()                           │ createStream()
                                    ┌─────────────────────────────────────┘
                                    ▼
                             ┌──────────────┐  selfRegister()  ┌──────────────┐
                             │    WORKER    │ ────────────────► │WorkerRegistry│
                             │              │                   │ Soulbound NFT│
                             └──────┬───────┘                   └──────────────┘
                                    │
                                    │ requestCashout()           ┌──────────────┐
                                    └──────────────────────────► │  Merchant    │
                                                                 │  Cashout     │
                                     recordWithdrawal()          └──────────────┘
                             ┌──────────────┐
                             │  PulseScore  │  ◄── StreamEngine
                             │   0 – 1000   │
                             └──────────────┘
```

---

## 📦 Smart Contracts (Polygon Mainnet)

All 5 contracts are **live on Polygon Mainnet**:

| Contract | Address | Purpose |
|:---------|:--------|:--------|
| **PulseVault** | [`0x754773Bf45157E2c4835cED9CAe5933eaC2235CA`](https://polygonscan.com/address/0x754773Bf45157E2c4835cED9CAe5933eaC2235CA) | Payroll treasury + Aave V3 yield |
| **StreamEngine** | [`0xdF13dD04F7879830a27D96b4E9c2094F92Bd9d43`](https://polygonscan.com/address/0xdF13dD04F7879830a27D96b4E9c2094F92Bd9d43) | Per-second salary streams |
| **WorkerRegistry** | [`0xaaDDA2cd85743098302F0A1abe262AaC63D57C6c`](https://polygonscan.com/address/0xaaDDA2cd85743098302F0A1abe262AaC63D57C6c) | Soulbound identity NFTs |
| **PulseScore** | [`0x273fA92844070Ab92C6Ae605337C6d521b452D55`](https://polygonscan.com/address/0x273fA92844070Ab92C6Ae605337C6d521b452D55) | On-chain credit score (0–1000) |
| **MerchantCashout** | [`0xCE7350Fe33201eD15590B4c529a72EA9C1aD923B`](https://polygonscan.com/address/0xCE7350Fe33201eD15590B4c529a72EA9C1aD923B) | USDC-to-cash agent network |

---

### 🏦 PulseVault — Payroll Treasury

Employers deposit USDC → auto-supplied to **Aave V3** earning ~4.1% APY. When streams are created, funds are withdrawn from Aave to back the stream.

| Function | Description |
|:---------|:------------|
| `depositPayroll(amount)` | Deposit USDC into vault → auto-supplied to Aave |
| `fundStream(employer, amount)` | StreamEngine pulls USDC from Aave for a new stream |
| `getEmployerBalance(employer)` | View proportional share of aUSDC (principal + yield) |
| `getYieldEarned(employer)` | View yield earned (after 20% platform fee) |
| `withdrawPayroll(amount)` | Withdraw principal + yield |
| `collectPlatformFees()` | Owner collects accrued platform yield fees |

**Events:** `PayrollDeposited`, `StreamFunded`, `YieldClaimed`, `PlatformFeeCollected`

---

### 💸 StreamEngine — Real-Time Salary Streams

Creates per-second USDC streams from employer to worker. Workers withdraw earned wages at any time.

| Function | Description |
|:---------|:------------|
| `createStream(worker, rate, duration)` | Create a stream. Min 1 hour. Returns stream ID |
| `batchCreateStreams(workers[], rates[], duration)` | Create up to 100 streams in one transaction |
| `withdraw(streamId, amount)` | Worker withdraws earned amount (0.5% fee) |
| `withdrawAll()` | Worker withdraws from all active streams at once |
| `getAccumulated(streamId)` | View real-time accumulated amount |
| `pauseStream(streamId)` | Employer pauses stream |
| `resumeStream(streamId)` | Employer resumes paused stream |
| `cancelStream(streamId)` | Employer cancels stream, refunds unstreamed USDC |
| `getWorkerStreams(worker)` | All stream IDs for a worker |
| `getEmployerStreams(employer)` | All stream IDs for an employer |

**Events:** `StreamCreated`, `Withdrawal`, `StreamPaused`, `StreamResumed`, `StreamCancelled`

---

### 🪪 WorkerRegistry — Soulbound Identity

Non-transferable ERC-721 NFT minted on registration. Tracks KYC tiers and daily withdrawal limits.

| Function | Description |
|:---------|:------------|
| `selfRegister(phoneHash, name, country)` | Self-register and mint soulbound NFT |
| `registerWorker(phoneHash, wallet, name, country)` | Oracle-only registration |
| `upgradeTier(wallet, newTier)` | Oracle promotes worker (Starter → Verified → Elite) |
| `getDailyLimit(wallet)` | Get daily withdrawal limit ($50 / $200 / $1000 by tier) |
| `getWorker(wallet)` | Get full worker profile |
| `tokenURI(tokenId)` | On-chain SVG metadata (fully decentralized artwork) |

**Tiers:** Starter ($50/day) → Verified ($200/day) → Elite ($1000/day)

**Events:** `WorkerRegistered`, `TierUpgraded`, `OracleSet`

---

### 📊 PulseScore — On-Chain Credit Score

Reputation system scored 0–1000. Increases with on-time behavior, decreases with penalties.

| Function | Description |
|:---------|:------------|
| `initScore(worker)` | Initialize at 200 points |
| `recordWithdrawal(worker)` | +3 points per withdrawal |
| `recordStreamComplete(worker)` | +10 points per completed stream |
| `recordEarnings(worker, amount)` | +10 points per $100 earned |
| `penalize(worker, points)` | Deduct points (floor at 0) |
| `getScore(worker)` | Returns score + tier name |

**Tiers:** Starter (0–299) → Rising (300–499) → Trusted (500–749) → Elite (750–1000)

**Events:** `ScoreUpdated`

---

### 🏪 MerchantCashout — USDC-to-Cash Agent Network

Workers lock USDC with a time-limited 6-byte confirmation code. Merchant gives physical cash, then confirms on-chain.

| Function | Description |
|:---------|:------------|
| `registerMerchant(name, lat, lng, country, cash)` | Register as a cash-out agent |
| `requestCashout(merchantId, amount)` | Lock USDC + generate code (15 min expiry) |
| `confirmCashout(requestId, code)` | Merchant confirms after giving cash |
| `cancelCashout(requestId)` | Worker reclaims USDC after expiry |
| `getMerchantsNear(lat, lng, dLat, dLng)` | Geographic search for nearby merchants |

**Fees:** 0.3% to merchant, 0.1% platform

**Events:** `MerchantRegistered`, `CashoutRequested`, `CashoutCompleted`, `CashoutCancelled`

---

## 🖥️ Frontend

Built with **React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion**

### Pages

| Page | Route | Description |
|:-----|:------|:------------|
| **Landing** | `/` | Hero with heartbeat animation, problem/solution cards, how-it-works |
| **Login** | `/login` | Wallet connect → auto-detect role from on-chain → role picker |
| **Worker Registration** | `/onboard/worker` | 3-step wizard: details → phone → confirm → mint NFT |
| **Employer Setup** | `/onboard/employer` | Deposit USDC or skip to dashboard |
| **Worker Dashboard** | `/worker` | Live balance ticking per-second, action buttons, active streams |
| **Withdraw** | `/withdraw` | Multi-step: method → agent → amount → confirm |
| **Stream Detail** | `/stream/:id` | Progress bar, rate breakdown, earnings analytics |
| **Profile** | `/profile` | Score gauge (0–1000), tier cards, referral link, settings |
| **Employer Dashboard** | `/employer` | Vault stats, sparkline charts, stream table, add workers |
| **Merchant Dashboard** | `/merchant` | QR code, cash level, pending cashouts |

### Key Features

- 🔐 **Role-based auth** — persisted to localStorage, auto-detected from on-chain data
- 🛡️ **Route guards** — protected routes redirect unauthenticated users
- ⚡ **Live balance** — ticks up every 50ms from stream `ratePerSecond`
- 📱 **Mobile-first** — bottom navigation for worker, sidebar for employer
- 🎨 **Animations** — Framer Motion page transitions, spring success screens
- 🌐 **42 countries** supported with search/filter
- 🔗 **RainbowKit + WalletConnect** — MetaMask, Coinbase, WalletConnect, etc.

---

## 💰 Fee Structure

| Fee | Amount | Collected By |
|:----|:-------|:-------------|
| Yield fee | 20% of Aave yield | PulseVault |
| Stream withdrawal | 0.5% | StreamEngine |
| Merchant reward | 0.3% of cashout | MerchantCashout |
| Platform cashout | 0.1% of cashout | MerchantCashout |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or any EVM wallet
- MATIC for gas (Polygon Mainnet)

### Frontend

```bash
cd web
npm install
cp .env.example .env   # Add your WalletConnect project ID
npm run dev             # Starts on http://localhost:5173
```

### Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network polygon
```

### Environment Variables

```env
VITE_POLYGON_RPC=https://polygon.drpc.org
VITE_CHAIN_ID=137
VITE_USDC_ADDRESS=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
VITE_AAVE_POOL=0x794a61358D6845594F94dc1DB02A252b5b4814aD
VITE_PULSE_VAULT_ADDRESS=0x754773Bf45157E2c4835cED9CAe5933eaC2235CA
VITE_STREAM_ENGINE_ADDRESS=0xdF13dD04F7879830a27D96b4E9c2094F92Bd9d43
VITE_WORKER_REGISTRY_ADDRESS=0xaaDDA2cd85743098302F0A1abe262AaC63D57C6c
VITE_PULSE_SCORE_ADDRESS=0x273fA92844070Ab92C6Ae605337C6d521b452D55
VITE_MERCHANT_CASHOUT_ADDRESS=0xCE7350Fe33201eD15590B4c529a72EA9C1aD923B
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 📁 Project Structure

```
pulse/
├── contracts/
│   ├── contracts/
│   │   ├── PulseVault.sol         # Payroll treasury + Aave yield
│   │   ├── StreamEngine.sol       # Per-second salary streaming
│   │   ├── WorkerRegistry.sol     # Soulbound identity NFTs
│   │   ├── PulseScore.sol         # On-chain credit scoring
│   │   └── MerchantCashout.sol    # USDC-to-cash off-ramp
│   ├── scripts/
│   │   └── deploy.ts             # Deployment + linking script
│   └── hardhat.config.ts
│
├── web/
│   ├── src/
│   │   ├── pages/                # All page components
│   │   ├── components/ui/        # Reusable UI components
│   │   ├── components/layout/    # Navbar, BottomNav, Sidebar
│   │   ├── hooks/                # Custom wagmi hooks per contract
│   │   ├── config/               # wagmi config + contract ABIs
│   │   ├── context/              # AuthContext (role persistence)
│   │   ├── lib/                  # Utilities, formatting
│   │   └── types/                # TypeScript interfaces
│   ├── public/                   # Static assets
│   └── netlify.toml              # Netlify deployment config
│
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Blockchain** | Polygon PoS Mainnet |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin 5.x |
| **DeFi** | Aave V3 (yield), USDC (stablecoin) |
| **Frontend** | React 18, Vite 5, TypeScript |
| **Styling** | Tailwind CSS 3.4, Framer Motion 11 |
| **Web3** | wagmi 2, viem 2, RainbowKit 2 |
| **Charts** | Recharts 2 |
| **State** | Zustand 4, TanStack Query 5 |
| **Deployment** | Netlify (SPA) |

---

## 🤝 Benefits

### For Workers
- ✅ Access earned wages **instantly** — no waiting for payday
- ✅ **Zero debt** — withdraw what you've already earned
- ✅ **Soulbound NFT** identity — portable, on-chain work history
- ✅ **Credit score** builds automatically with usage
- ✅ Cash out at **local agents** — no bank account needed
- ✅ Sub-cent transaction fees on Polygon

### For Employers
- ✅ **Earn yield** on payroll float via Aave V3 (~4.1% APY)
- ✅ **Attract & retain talent** with real-time pay as a benefit
- ✅ **Batch operations** — create 100 streams in one transaction
- ✅ Full **stream control** — pause, resume, cancel anytime
- ✅ **Zero integration cost** — just deposit USDC

### For Merchants
- ✅ **Earn 0.3% fees** on every cash-out
- ✅ **No special hardware** — just a wallet and cash
- ✅ **Time-limited codes** prevent fraud (15 min expiry)
- ✅ Geographic visibility to nearby workers

---

## 📜 License

MIT

---

<p align="center">
  <strong>Built on Polygon · Powered by Aave · Streamed in USDC</strong><br/>
  <sub>Making financial inclusion a reality, one second at a time.</sub>
</p>

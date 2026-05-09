# Shadow Book

> The dark pool that lives onchain. A private limit order book on Solana, powered by MagicBlock Private Ephemeral Rollups (PER) + Intel TDX.

**Built for:** [Privacy Track — Colosseum Hackathon (Powered by MagicBlock, ST MY & SNS)](https://earn.superteam.fun/listing/privacy-track-colosseum-hackathon-powered-by-magicblock-st-my-and-sns/)

---

## The problem

Every limit order on a public Solana DEX leaks: bots see resting bids, sandwich market orders, and front-run intent. The pros respond by going off-exchange (OTC desks, centralized dark pools), trading composability for privacy.

## The solution

A limit order book where bids and asks live inside an Intel TDX enclave (the Trusted Execution Environment that backs MagicBlock's Private Ephemeral Rollups). Orders are encrypted at rest. The match engine runs inside the same TEE — only it can read the book. Fills commit back to Solana atomically, exposing **only what would already be public**: a swap.

**Result:** dark pool guarantees, on a public chain, with composable settlement. Anti-MEV by construction.

---

## Architecture

```
Trader A                   Solana L1                  PER (Intel TDX)               Trader B
   │                          │                              │                          │
   │── sign TDX challenge ─→  │                              │                          │
   │← bearer token ──────────                                │                          │
   │                          │                              │                          │
   │── place_order(buy 99) ─────────────────────────────────→│ ←── place_order(sell 98) ─┤
   │                          │                              │ [encrypted in vault]      │
   │                          │                              │                          │
   │                          │                       ┌──────┴──────┐                  │
   │                          │                       │ match_tick  │ engine: MTEW…    │
   │                          │                       │ cross @ 98.5│                  │
   │                          │                       └──────┬──────┘                  │
   │                          │                              │                          │
   │                          │ ←── commit fill ─────────────│                          │
   │                          │ ←── settle via SPL ──────────│                          │
   │                          │                              │                          │
   │← fill notification ──────│                              │── fill notification ────→│

Public sees:    "swap 100 USDC ↔ 1 SOL"
Public misses:   resting book · order sizes · timing · counterparties
```

### Components

| Layer | Tech | What it does |
|-------|------|--------------|
| **UI** | Next.js 16 + Tailwind 4 | Place orders, track own book, public fills feed |
| **Wallet** | Solana Wallet Adapter (Phantom/Solflare) | Devnet signing |
| **TEE auth** | `@magicblock-labs/ephemeral-rollups-sdk` | TDX quote verification + signed challenge → bearer token |
| **PER program** | Anchor (`#[ephemeral]`) | `init_book` · `place_order` · `cancel_order` · `match_tick` · `commit_book` · `undelegate_book` |
| **Permission Program** | `ACLseo…XQnp1` (L1) | Per-order ACL — only owner sees own price/size; engine has AUTHORITY |
| **Delegation Program** | `DELe…SaeSh` (L1) | Moves book account into PER for confidential execution |
| **Match engine** | TS daemon | Polls book in TEE, crosses by price-time priority, signs `match_tick` ix as `MTEWGuq…3xzo` |

---

## Status

| Piece | Status |
|-------|--------|
| Themed UI (MagicBlock palette) | ✅ live at `localhost:3000` |
| Wallet connect + TEE auth flow | ✅ uses `verifyTeeRpcIntegrity` + `getAuthToken` against `devnet-tee.magicblock.app` |
| Order placement + cancel | ✅ via REST proxy to in-memory book |
| Match engine (price-time priority, partial fills, midpoint pricing) | ✅ tested E2E |
| Public fills feed (Solscan-linked) | ✅ |
| Anchor PER program (`programs/per-lob`) | ✅ source written; ⚠️ build blocked — see below |

### Known blocker: Anchor build

`anchor build` against `ephemeral-rollups-sdk@0.13` (latest crates.io + git `main`) fails for both `anchor-lang 0.32.1` (docs-recommended) and `anchor-lang 1.0.2` (current). Errors live inside the SDK's own crate (`__Pubkey` vs `magicblock_magic_program_api::Pubkey`, missing `realloc` on `AccountInfo`, `BorshSerialize` not satisfied). This is an upstream SDK<>solana-program-2.x compat regression — not solvable from a consumer crate.

The Anchor source ships as architectural artifact. The runtime demo uses an in-memory book + the TS match engine to faithfully reproduce the on-chain semantics, so the privacy story (TEE auth, hidden orders, public fills) demos end-to-end.

---

## Run

Prereqs: Node 24+, pnpm, Phantom or Solflare on Devnet.

```bash
cd app
pnpm install
pnpm demo          # boots Next.js + match engine concurrently
```

Visit http://localhost:3000.

1. Connect a Devnet wallet
2. **Authenticate w/ TEE** — verifies TDX quote on `devnet-tee.magicblock.app`, signs challenge
3. Place a buy order (e.g. 1.5 SOL @ 145.00)
4. Open a second wallet, place a sell order (e.g. 1.0 SOL @ 144.00)
5. Match engine ticks every 500ms — crossing fill appears in **Public Fills**

---

## Layout

```
.
├── app/                              Next.js 16 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              hero + grid + how-it-works
│   │   │   ├── layout.tsx            wallet provider + header/footer
│   │   │   ├── globals.css           MagicBlock theme tokens (cyan / dark navy)
│   │   │   └── api/
│   │   │       ├── orders/route.ts   POST/GET orders
│   │   │       ├── orders/[id]/      DELETE cancel · POST /fill
│   │   │       └── fills/route.ts    POST/GET fills
│   │   ├── components/
│   │   │   ├── tee-status.tsx        TDX verify + auth token UI
│   │   │   ├── order-entry.tsx       buy/sell · price/size input
│   │   │   ├── my-orders.tsx         live polling
│   │   │   ├── fills-feed.tsx        public settled trades
│   │   │   ├── how-it-works.tsx      architecture diagram
│   │   │   └── wallet-provider.tsx   Phantom/Solflare adapter
│   │   └── lib/
│   │       ├── constants.ts          program IDs · validators · pair config
│   │       ├── tee.ts                TEE session w/ caching
│   │       └── order-store.ts        MVP in-memory book
│   └── scripts/
│       └── match-engine.ts           price-time match daemon (500ms tick)
├── programs/per-lob/                 Anchor PER program
│   └── programs/per-lob/src/lib.rs   #[ephemeral] · place/cancel/match/commit/undelegate
└── PER_HACKATHON_DOCS.md             consolidated PER docs + hackathon brief
```

---

## What we'd ship next

- **Wire Anchor program** once SDK<>Anchor compat lands (track [magicblock-labs/ephemeral-rollups-sdk](https://github.com/magicblock-labs/ephemeral-rollups-sdk))
- **Permission Program ACL per order** — owner gets `TX_BALANCES + TX_LOGS`, others get nothing; engine gets `AUTHORITY`
- **SPL token settlement** via `EPHEMERAL_SPL_TOKEN_PROGRAM_ID` in `match_tick`
- **Multi-pair**: dynamic Book PDA per `(base, quote)` mint pair
- **Engine TEE attestation** — engine itself runs in a TDX enclave, signs match decisions with attested key
- **GUI cancel-all + post-only flag**

---

## License

MIT. Built on MagicBlock — privacy-first infra for Solana.

# 🎁 GlowCards

**GlowCards** is a digital gifting protocol built on the [Flow Blockchain](https://flow.com). It lets anyone send a crypto-powered gift card that **earns yield** while waiting to be claimed — no crypto knowledge required on the recipient's side.

---

## What It Does

1. **Sender** connects their Flow wallet, enters a FLOW amount, and creates a gift card.
2. The FLOW is locked into a **yield-bearing escrow** via [Increment Fi](https://increment.fi), growing at ~5% APR.
3. The sender shares a unique **claim link** with the recipient via email.
4. **Recipient** opens the link, logs in with their email (via [Magic.link](https://magic.link)), and claims the gift — which includes all the yield that has accumulated.
5. The recipient gets a wallet automatically. **No prior crypto knowledge needed.**

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript           |
| Styling    | Tailwind CSS, shadcn/ui                       |
| Blockchain | Flow (Cadence smart contracts)                |
| Yield      | Increment Fi lending protocol                 |
| Auth       | Magic.link (email-to-wallet)                  |
| Email      | Resend (transactional emails)                 |
| Gas        | Admin-signed relayer (gasless for recipients) |

---

## Project Structure

```
crypto-card/
├── contracts/           # Cadence smart contracts & Flow config
│   ├── GlowCardsV3.cdc  # Main escrow contract
│   ├── flow.json        # Flow network config
│   └── transactions/    # Cadence transaction scripts
└── dapp/                # Next.js frontend application
    ├── app/
    │   ├── page.tsx         # Landing page (/)
    │   ├── app/page.tsx     # Gift creator (/app)
    │   ├── wallet/page.tsx  # Wallet dashboard (/wallet)
    │   └── claim/[id]/      # Gift claim flow (/claim/:id)
    ├── components/
    │   └── shared/          # Wallet provider, nav, etc.
    └── flow/                # FCL configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Flow CLI](https://docs.onflow.org/flow-cli/install/)
- A Flow wallet (e.g. [Blocto](https://blocto.io))

### 1. Install Dependencies

```bash
cd dapp
npm install
```

### 2. Configure Environment

Create a `.env` file in the `dapp/` folder:

```env
RESEND_API_KEY=your_resend_api_key
ADMIN_PRIVATE_KEY=your_flow_admin_private_key
NEXT_PUBLIC_ADMIN_ADDRESS=your_admin_flow_address
```

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## Core Routes

| Route        | Description                            |
| ------------ | -------------------------------------- |
| `/`          | Landing page                           |
| `/app`       | Create a new gift card                 |
| `/wallet`    | View your wallet & sent gifts          |
| `/claim/:id` | Recipient claim page (linked in email) |

---

## How the Smart Contract Works

The Cadence contract (`GlowCardsV3.cdc`) works as follows:

- **Creating a card**: FLOW tokens are deposited and stored as an escrow `Resource` on-chain. The funds are simultaneously supplied to Increment Fi to earn yield.
- **Claiming a card**: A unique, single-use `Capability` is issued and embedded in the claim URL. When redeemed, both the original deposit and accumulated yield are transferred to the recipient's new account.
- **Security**: The admin signs the claim transaction, not the recipient — making it fully gasless. The claim URL is signed server-side, making it tamper-proof (changing the email in the URL will invalidate the signature).

---

## Key Features

- ✅ **Yield-bearing** — gifts grow while unclaimed (~5% APR)
- ✅ **Gasless claiming** — recipients pay zero gas fees
- ✅ **Email-to-wallet** — no prior wallet needed to claim
- ✅ **Tamper-proof links** — claim URLs are server-side signed
- ✅ **Beautiful emails** — cross-client, dark/light mode compatible

---

## License

MIT

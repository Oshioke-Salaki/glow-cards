# GlowCards - Consumer DeFi Gift Card Platform

## Overview

GlowCards is a consumer-friendly DeFi gift card platform built on the Flow Blockchain. It allows senders to create a gift card by depositing funds, which are then placed into a yield-bearing escrow (using Increment Fi) so the gift accrues interest while unclaimed. The recipient receives a "Magic Link" allowing them to claim the gift via an Email-to-Wallet flow, which is entirely gasless and does not require a pre-existing wallet or any crypto knowledge.

**Constraint:** Strict avoidance of crypto jargon (e.g., use "Gift Amount" and "Claim Gift").

## Technical Milestones

### 1. Workspace Setup & SDKs

- **Framework**: Next.js (App Router) with TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui for a "Premium Fintech" aesthetic.
- **Blockchain SDKs**: Flow `@onflow/fcl`.
- **Auth**: Magic.link integration (`magic-sdk`) for the claiming process.

### 2. Smart Contracts (Flow / Cadence)

- **Escrow Contract**: A non-custodial Cadence contract storing funds as a Resource.
- **Yield Integration**: Integrate Increment Fi to supply escrowed funds to a lending pool.
- **Claim Capability**: Generate a unique, disposable capability to securely claim the funds without a pre-existing wallet.

### 3. Backend & Relayer (Gasless UX)

- **Sponsored Transactions**: Set up a backend relayer API ("Gas Tank").
- **Flow Hybrid Account Model**: Use Flow's Account Linking / Child Accounts to seamlessly create an account for the email recipient, and transfer the initial deposit + yield.

### 4. Frontend & UX

- **No Crypto Jargon**: Use terms like "Gift Amount" and "Claim Gift".
- **Create Gift Flow**: UI for sender to enter amount, fund via wallet, and get the shareable link.
- **Claim Gift Flow**: Recipient clicks link -> Magic.link Email Auth -> Child Account created -> Funds claimed.

## Verification Plan

- **Cadence Tests**: Write Flow test scripts for contract logic.
- **E2E UI Testing**: Use local emulator and web browser test tools to visually verify the frontend implementation meets the "Premium Fintech" aesthetic and that the entire gift creation/claiming flow works as expected.

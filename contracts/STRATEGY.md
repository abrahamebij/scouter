# YieldX Strategy Overview

YieldX is a **leveraged tokenized S&P 500 vault** (ERC-4626) on Ink Sepolia L2. It creates **3x long exposure to wSPYx** (tokenized S&P 500) using a flash loan looping strategy through Tydro (Aave V3 fork).

## How It Works

1. User deposits **USDC**
2. Vault takes a **flash loan** from Tydro (2x the deposit for 3x leverage)
3. Swaps **all USDC → wSPYx** via the swap router (oracle-priced, 0.3% spread)
4. Supplies **wSPYx as collateral** to Tydro
5. **Borrows USDC** against that collateral to repay the flash loan
6. Result: **3x wSPYx exposure** financed by leveraged USDC debt

A keeper bot polls every 60s and calls `rebalance()` if leverage drifts beyond 10% tolerance.

## Risks

### Market Risks

- **Liquidation** — a sharp wSPYx price drop can push the health factor below the liquidation threshold. Min health factor is set to 1.2 but there's no circuit breaker.
- **Borrowing costs** — variable-rate USDC interest accrues continuously and can erode yields or make the position underwater.
- **Swap slippage** — ~0.6% round-trip cost (0.3% each way).

### Smart Contract / Operational Risks

- **Single oracle dependency** — all pricing from Tydro's oracle, no fallback.
- **Keeper centralization** — one address controls rebalancing, no timelock on parameter changes.
- **No emergency pause** mechanism, no withdrawal queue, no multi-sig.
- **MockSwapRouter** is testnet-only — no real DEX integration yet.

## Contract Addresses (Ink Sepolia)

| Contract                       | Address                                      |
| ------------------------------ | -------------------------------------------- |
| **LeveragedVault (yxSPY)**     | `0x1D8C8733a8369D3Db37fD88100303a4AAF5a801A` |
| **MockSwapRouter**             | `0xBC9987bCB52C7a534e4704E13fBFe60e45eaF5c3` |
| **USDC**                       | `0x6b57475467cd854d36Be7FB614caDa5207838943` |
| **wSPYx**                      | `0x9eF9f9B22d3CA9769e28e769e2AAA3C2B0072D0e` |
| **aWspyx (collateral receipt)** | `0x4199CC1F5ed0d796563d7CcB2e036253E2C18281` |
| **Debt USDC**                  | `0x0E76414d433ddfe8004d2A7505d218874875a996` |
| **Tydro PoolAddressesProvider** | `0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D` |
| **Tydro Price Oracle**         | `0xB1532b76D054c9F9E61b25c4d91f69B4133E4671` |

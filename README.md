# xPrime

xPrime is an onchain prime brokerage for tokenized equities.

It gives users a unified interface to earn, borrow, trade, hedge, spend, and bridge against xStocks. Users specify their financial intent, and xPrime maps that intent to the right strategy or execution flow.

## Repo structure

```text
app/        Next.js app
contracts/  Foundry contracts and keeper
```

## What xPrime is

xPrime is a prime brokerage rebuilt for the internet. It helps users unlock yield, leverage, and liquidity from their stock portfolio without splitting activity across disconnected apps and venues.

The product is organized around four core flows.

### Earn

xPrime packages structured strategies into simple vault and execution flows.

That includes:

- tokenized leveraged ETFs
- USD carry strategy
- basis trade
- covered calls
- wheel strategy

In this repo, the implemented vault contracts are the leveraged ETF vault and the USD carry vault.

### Borrow

xPrime lets users unlock liquidity without selling their xStocks.

That includes:

- floating rate borrowing against equity collateral
- fixed term borrowing using collar structures designed for downside protection and no liquidation style borrowing

### Trade

xPrime supports:

- perpetual trading on tokenized equities
- spot xStocks trading across Ink and Ethereum
- event driven options trading around earnings through straddle style flows, with broader options flows coming soon via Sts Digital options RFQ
- hedging flows built on the same positions

### Spend

xPrime includes a digital card flow so users can spend against the value of their holdings.

## How xPrime works

xPrime acts as the discovery, routing, and execution layer for onchain equities.

Users start with a goal, market view, and risk tolerance. xPrime then recommends the right strategy and routes execution across the protocols used by that flow.

In the current codebase:

- Hyperliquid powers perp market data and trading in the terminal
- CoW Swap powers spot xStocks execution on Ink and Ethereum
- LiFi powers bridging flows
- Tydro powers the leveraged ETF vault on Ink Sepolia
- Morpho and Flowdesk power the carry vault on Ethereum
- Options coming soon via Sts Digital options RFQ

## Contracts in this repo

`LeveragedVault.sol` is an ERC4626 vault on Ink Sepolia for leveraged SPYx exposure. It uses flash loans and Tydro to create leveraged exposure and a keeper to rebalance back to target leverage.

Vault address: `0x47d144a13bEd591688DeA00890001448F3f96196`

`CarryVault.sol` is an ERC4626 vault on Ethereum for the SPYx aUSD carry strategy. It collateralizes SPYx on Morpho, borrows aUSD, and deposits that aUSD into a Flowdesk vault.

Vault address: `0xfbddeafAdcC77209870b7d70782714AEB40c39Da`

`contracts/keeper` contains the offchain rebalancer for the leveraged vault.

## Run the app

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test contracts

```bash
cd contracts
forge build
forge test
```

## Deploy contracts

Create `contracts/.env` from `contracts/.env.example`.

For Ink Sepolia deployments, set:

```bash
INK_SEPOLIA_RPC_URL=...
DEPLOYER_PRIVATE_KEY=...
```

Deploy the leveraged vault:

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url $INK_SEPOLIA_RPC_URL --broadcast
```

Deploy the carry vault:

```bash
cd contracts
forge script script/DeployCarryVault.s.sol:DeployCarryVault --rpc-url $ETH_RPC_URL --broadcast
```

## Run the keeper

Create `contracts/keeper/.env` from `contracts/keeper/.env.example`, then run:

```bash
cd contracts/keeper
npm install
npm run start
```

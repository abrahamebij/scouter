# xPrime Contracts

Smart contracts for xPrime vault strategies.

This package contains two ERC4626 strategy vaults and a keeper:

- `src/LeveragedVault.sol` for leveraged SPYx exposure on Ink Sepolia using Tydro and flash loans
- `src/CarryVault.sol` for the SPYx aUSD carry strategy on Ethereum using Morpho and Flowdesk
- `keeper/` for leveraged vault rebalancing

## Build and test

```bash
forge build
forge test
```

## Deploy

Create `.env` from `.env.example` and set:

```bash
INK_SEPOLIA_RPC_URL=...
DEPLOYER_PRIVATE_KEY=...
```

Deploy leveraged vault:

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url $INK_SEPOLIA_RPC_URL --broadcast
```

Deploy carry vault:

```bash
forge script script/DeployCarryVault.s.sol:DeployCarryVault --rpc-url $ETH_RPC_URL --broadcast
```

## Keeper

Create `keeper/.env` from `keeper/.env.example`, then run:

```bash
cd keeper
npm install
npm run start
```

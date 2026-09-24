import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const POLL_INTERVAL_MS = 60_000; // 1 minute

const VAULT_ABI = [
  "function rebalance() external",
  "function targetLeverageRatio() external view returns (uint256)",
  "function leverageTolerance() external view returns (uint256)",
  "function getCurrentLeverage() external view returns (uint256)",
  "function POOL() external view returns (address)",
  "function totalAssets() external view returns (uint256)",
  "function minHealthFactor() external view returns (uint256)",
];

const POOL_ABI = [
  "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
];

const BPS = 10_000n;

async function main() {
  const rpcUrl = process.env.INK_SEPOLIA_RPC_URL;
  const privateKey = process.env.KEEPER_PRIVATE_KEY;
  const vaultAddress = process.env.VAULT_ADDRESS;

  if (!rpcUrl || !privateKey || !vaultAddress) {
    console.error("Missing env vars: INK_SEPOLIA_RPC_URL, KEEPER_PRIVATE_KEY, VAULT_ADDRESS");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);

  console.log(`YieldX Keeper started`);
  console.log(`Vault: ${vaultAddress}`);
  console.log(`Keeper: ${wallet.address}`);

  const poolAddress = await vault.POOL();
  const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

  const targetLeverage = await vault.targetLeverageRatio();
  const tolerance = await vault.leverageTolerance();

  console.log(`Target leverage: ${Number(targetLeverage) / Number(BPS)}x`);
  console.log(`Tolerance: ${Number(tolerance) / 100}%`);
  console.log(`Polling every ${POLL_INTERVAL_MS / 1000}s\n`);

  while (true) {
    try {
      await checkAndRebalance(vault, pool, vaultAddress, targetLeverage, tolerance);
    } catch (err) {
      console.error(`[${timestamp()}] Error:`, err);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

async function checkAndRebalance(
  vault: ethers.Contract,
  pool: ethers.Contract,
  vaultAddress: string,
  targetLeverage: bigint,
  tolerance: bigint
) {
  const accountData = await pool.getUserAccountData(vaultAddress);
  const totalCollateral: bigint = accountData.totalCollateralBase;
  const totalDebt: bigint = accountData.totalDebtBase;
  const healthFactor: bigint = accountData.healthFactor;

  if (totalCollateral === 0n) {
    console.log(`[${timestamp()}] No position open. Skipping.`);
    return;
  }

  const netValue = totalCollateral - totalDebt;
  if (netValue <= 0n) {
    console.error(`[${timestamp()}] CRITICAL: Vault is underwater!`);
    return;
  }

  const currentLeverage = (totalCollateral * BPS) / netValue;
  const diff =
    currentLeverage > targetLeverage
      ? currentLeverage - targetLeverage
      : targetLeverage - currentLeverage;

  let navStr = "N/A";
  try {
    const totalAssets = await vault.totalAssets();
    navStr = `${ethers.formatUnits(totalAssets, 6)} USDC`;
  } catch {
    // totalAssets can revert on some RPC providers due to timestamp issues
  }

  console.log(
    `[${timestamp()}] ` +
      `Leverage: ${(Number(currentLeverage) / Number(BPS)).toFixed(3)}x | ` +
      `Target: ${(Number(targetLeverage) / Number(BPS)).toFixed(1)}x | ` +
      `HF: ${(Number(healthFactor) / 1e18).toFixed(4)} | ` +
      `NAV: ${navStr} | ` +
      `Drift: ${(Number(diff) / 100).toFixed(1)}%`
  );

  if (diff > tolerance) {
    console.log(`[${timestamp()}] Leverage drift exceeds tolerance. Rebalancing...`);

    try {
      const tx = await vault.rebalance();
      console.log(`[${timestamp()}] Rebalance tx sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(
        `[${timestamp()}] Rebalance confirmed in block ${receipt.blockNumber} ` +
          `(gas: ${receipt.gasUsed.toString()})`
      );

      // Log new state
      const newLeverage = await vault.getCurrentLeverage();
      console.log(
        `[${timestamp()}] New leverage: ${(Number(newLeverage) / Number(BPS)).toFixed(3)}x`
      );
    } catch (err: any) {
      console.error(`[${timestamp()}] Rebalance failed:`, err.reason || err.message);
    }
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);

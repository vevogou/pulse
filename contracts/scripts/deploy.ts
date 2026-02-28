import { ethers } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");

  const USDC = process.env.USDC_ADDRESS!;
  const AAVE_POOL = process.env.AAVE_V3_POOL!;
  const AAVE_AUSDC = process.env.AAVE_USDC_ATOKEN!;

  // 1. Deploy PulseVault
  console.log("\n1. Deploying PulseVault...");
  const PulseVault = await ethers.getContractFactory("PulseVault");
  const vault = await PulseVault.deploy(USDC, AAVE_POOL, AAVE_AUSDC);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("PulseVault:", vaultAddr);

  // 2. Deploy StreamEngine
  console.log("\n2. Deploying StreamEngine...");
  const StreamEngine = await ethers.getContractFactory("StreamEngine");
  const stream = await StreamEngine.deploy(USDC, vaultAddr);
  await stream.waitForDeployment();
  const streamAddr = await stream.getAddress();
  console.log("StreamEngine:", streamAddr);

  // 3. Set StreamEngine in Vault
  console.log("\n3. Linking StreamEngine to PulseVault...");
  await vault.setStreamEngine(streamAddr);
  console.log("Linked!");

  // 4. Deploy WorkerRegistry
  console.log("\n4. Deploying WorkerRegistry...");
  const WorkerRegistry = await ethers.getContractFactory("WorkerRegistry");
  const registry = await WorkerRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("WorkerRegistry:", registryAddr);

  // 5. Deploy PulseScore
  console.log("\n5. Deploying PulseScore...");
  const PulseScore = await ethers.getContractFactory("PulseScore");
  const score = await PulseScore.deploy();
  await score.waitForDeployment();
  const scoreAddr = await score.getAddress();
  console.log("PulseScore:", scoreAddr);

  // 6. Deploy MerchantCashout
  console.log("\n6. Deploying MerchantCashout...");
  const MerchantCashout = await ethers.getContractFactory("MerchantCashout");
  const cashout = await MerchantCashout.deploy(USDC);
  await cashout.waitForDeployment();
  const cashoutAddr = await cashout.getAddress();
  console.log("MerchantCashout:", cashoutAddr);

  // 7. Link PulseScore to StreamEngine
  console.log("\n7. Linking PulseScore...");
  await stream.setPulseScore(scoreAddr);
  await score.setCaller(streamAddr, true);
  await score.setCaller(cashoutAddr, true);
  console.log("Linked!");

  // 8. Set oracle in WorkerRegistry (deployer is initial oracle)
  await registry.setOracle(deployer.address, true);

  // Save deployment
  const deployment = {
    network: "polygon-mainnet",
    chainId: 137,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PULSE_VAULT_ADDRESS: vaultAddr,
      STREAM_ENGINE_ADDRESS: streamAddr,
      WORKER_REGISTRY_ADDRESS: registryAddr,
      PULSE_SCORE_ADDRESS: scoreAddr,
      MERCHANT_CASHOUT_ADDRESS: cashoutAddr,
    },
  };

  fs.writeFileSync("../deployment.json", JSON.stringify(deployment, null, 2));
  console.log("\nDeployment saved to deployment.json");
  console.log("\nAdd these to your .env and web/.env:");
  Object.entries(deployment.contracts).forEach(([key, val]) => {
    console.log(`${key}=${val}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

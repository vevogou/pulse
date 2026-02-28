import { run } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

async function main() {
  const deploymentPath = "../../deployment.json";
  if (!fs.existsSync(deploymentPath)) {
    console.error("deployment.json not found. Run deploy first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contracts = deployment.contracts;

  const USDC = process.env.USDC_ADDRESS!;
  const AAVE_POOL = process.env.AAVE_V3_POOL!;
  const AAVE_AUSDC = process.env.AAVE_USDC_ATOKEN!;

  const verifications = [
    {
      name: "PulseVault",
      address: contracts.PULSE_VAULT_ADDRESS,
      constructorArguments: [USDC, AAVE_POOL, AAVE_AUSDC],
    },
    {
      name: "StreamEngine",
      address: contracts.STREAM_ENGINE_ADDRESS,
      constructorArguments: [USDC, contracts.PULSE_VAULT_ADDRESS],
    },
    {
      name: "WorkerRegistry",
      address: contracts.WORKER_REGISTRY_ADDRESS,
      constructorArguments: [],
    },
    {
      name: "PulseScore",
      address: contracts.PULSE_SCORE_ADDRESS,
      constructorArguments: [],
    },
    {
      name: "MerchantCashout",
      address: contracts.MERCHANT_CASHOUT_ADDRESS,
      constructorArguments: [USDC],
    },
  ];

  for (const v of verifications) {
    console.log(`\nVerifying ${v.name} at ${v.address}...`);
    try {
      await run("verify:verify", {
        address: v.address,
        constructorArguments: v.constructorArguments,
      });
      console.log(`${v.name} verified!`);
    } catch (e: any) {
      if (e.message.includes("Already Verified")) {
        console.log(`${v.name} already verified.`);
      } else {
        console.error(`Failed to verify ${v.name}:`, e.message);
      }
    }
  }

  console.log("\nAll contracts verified on Polygonscan.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

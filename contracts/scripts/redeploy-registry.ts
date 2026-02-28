import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log('Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'POL');

  // Deploy new WorkerRegistry
  console.log('\nDeploying new WorkerRegistry with selfRegister...');
  const WorkerRegistry = await ethers.getContractFactory('WorkerRegistry');
  const workerRegistry = await WorkerRegistry.deploy();
  await workerRegistry.waitForDeployment();
  const newAddr = await workerRegistry.getAddress();
  console.log('New WorkerRegistry:', newAddr);

  // Set PulseScore as oracle on WorkerRegistry (so score updates work)
  const PULSE_SCORE = '0x273fA92844070Ab92C6Ae605337C6d521b452D55';
  const STREAM_ENGINE = '0xdF13dD04F7879830a27D96b4E9c2094F92Bd9d43';
  
  console.log('Setting PulseScore as oracle...');
  let tx = await workerRegistry.setOracle(PULSE_SCORE, true);
  await tx.wait();
  
  console.log('Setting StreamEngine as oracle...');
  tx = await workerRegistry.setOracle(STREAM_ENGINE, true);
  await tx.wait();

  console.log('\n=== DONE ===');
  console.log('New WorkerRegistry address:', newAddr);
  console.log('\nUpdate these files:');
  console.log('  web/.env  ->  VITE_WORKER_REGISTRY_ADDRESS=' + newAddr);
  console.log('  .env      ->  WORKER_REGISTRY_ADDRESS=' + newAddr);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

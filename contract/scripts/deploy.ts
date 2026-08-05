import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Umbra Pay contracts with account:", deployer.address);
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(`Target Network Chain ID: ${chainId}`);

  // Deploy UmbraOrgFactory on Coston2
  const Factory = await ethers.getContractFactory("UmbraOrgFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`\n[Coston2] UmbraOrgFactory deployed to: ${factoryAddress}`);

  // Deploy a default demo organization for testing
  const teeVaultAddress = process.env.TEE_VAULT_ADDRESS || deployer.address;
  const createTx = await factory.createOrg("Umbra Pay Technologies", teeVaultAddress);
  await createTx.wait();

  const orgs = await factory.getOrganizations(deployer.address);
  const demoOrgAddress = orgs[0];

  console.log(`[Coston2] Demo UmbraOrg deployed to: ${demoOrgAddress}`);
  console.log(`TEE Enclave Vault Address (Sepolia Payouts): ${teeVaultAddress}`);

  console.log(`\n========================================`);
  console.log(`Copy to frontend/.env.local:`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_DEMO_ORG_ADDRESS=${demoOrgAddress}`);
  console.log(`NEXT_PUBLIC_TEE_VAULT_ADDRESS=${teeVaultAddress}`);
  console.log(`NEXT_PUBLIC_COSTON2_CHAIN_ID=114`);
  console.log(`NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111`);
  console.log(`========================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

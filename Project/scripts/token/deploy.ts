import { ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../../artifacts/contracts/Token.sol/MyToken.json";
import {setupProvider, wallet} from "../../utils/setup-provider";

setupProvider()

export default async function tokenDeploy(signer:ethers.Wallet) : Promise<string> {
  const tokenFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );
  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();
  console.log("Completed");
  console.log(`Token Contract deployed at ${tokenContract.address}`);
  return tokenContract.address
}

async function main() {
const signer =  await wallet();
await tokenDeploy(signer)
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
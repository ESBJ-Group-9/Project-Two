import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../../artifacts/contracts/Token.sol/MyToken.json";
import { setupProvider, wallet } from "../../utils/setup-provider";
import { MyToken } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

setupProvider();

async function delegateVote(
  signer: ethers.Wallet,
  tokenAddress: string,
  delegateeAddress: string
) {
  console.log(`Attaching ballot contract interface to address ${tokenAddress}`);
  const tokenContract: MyToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as MyToken;

  const delegateTx = delegateeAddress
    ? await tokenContract.delegate(delegateeAddress)
    : await tokenContract.delegate(signer.address);
  await delegateTx.wait(1);
  console.log(`delegate completed!`);
  console.log(`Transaction completed. Hash: ${delegateTx.hash}`);
}
async function main() {
  if (process.argv.length < 3) throw new Error("token address missing");
  const tokenAddress = process.argv[2];
  const delegateeAddress = process.argv[3];
  const signer = await wallet();
  await delegateVote(signer, tokenAddress, delegateeAddress);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

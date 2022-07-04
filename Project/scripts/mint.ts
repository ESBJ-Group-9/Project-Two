import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { setupProvider, wallet } from "../utils/setup-provider";
import { MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

setupProvider();

async function mintToken(
  signer: ethers.Wallet,
  tokenAddress: string,
  baseVotePower: number
) {

  console.log(`Attaching token contract interface to address ${tokenAddress}`);
  const tokenContract: MyToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as MyToken;

  const mintTx = await tokenContract.mint(signer.address, ethers.utils.parseEther(baseVotePower.toFixed(18)));
  await mintTx.wait(1);
  console.log(`Mint completed for address ${signer.address}`);
}
async function main() {
    if (process.argv.length < 3) throw new Error("token address missing");
    if (process.argv.length < 4) throw new Error("input ether amount");
    if (Number(process.argv[3]) < 10)
      throw new Error("Insuffient amount, base vote power should equal 10");
  
    const tokenAddress = process.argv[2];
    const baseVotePower = Number(process.argv[3]);
  const signer = await wallet();
  await mintToken(signer, tokenAddress, baseVotePower);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import tokenContract from "../token/deploy";
import { setupProvider, wallet } from "../../utils/setup-provider";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

setupProvider();

async function ballotDeploy(
  signer: ethers.Wallet,
  proposals: string[],
  tokenAdress: string
) {
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals),
    tokenAdress
  );
  console.log("Awaiting confirmations");
  await ballotContract.deployed();
  console.log("Completed");
  console.log(`Ballot Contract deployed at ${ballotContract.address}`);
}
async function main() {
  console.log("Proposals: ");
  const proposals = process.argv.slice(2);
  if (proposals.length < 2) throw new Error("Not enough proposals provided");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  const signer = await wallet();
  const tokenAdress = "0x97E7332b33404Ef8F5dA1A6DbBC35E5864062f89";
  await ballotDeploy(signer, proposals, tokenAdress);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Deployed contract in the recording: 0x1Af1CD6d6da31b1a8add5b5F48120410ddEAE4be
// Token Tracker: https://goerli.etherscan.io/token/0x9563abBe9a54d7Ce0448ef1186D838789fe8F892

// Token contract : 0x97E7332b33404Ef8F5dA1A6DbBC35E5864062f89
// Balot contract : 0x9563abBe9a54d7Ce0448ef1186D838789fe8F892

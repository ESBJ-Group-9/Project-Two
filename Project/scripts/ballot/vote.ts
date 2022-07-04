import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { setupProvider, wallet } from "../../utils/setup-provider";
import { CustomBallot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

setupProvider();

async function vote(
  signer: ethers.Wallet,
  ballotAddress: string,
  votingAmount: number,
  indexToVote: number
) {
  console.log(`Attaching token contract interface to address ${ballotAddress}`);
  const ballotContract: CustomBallot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as CustomBallot;

  const votingPowerAvailable = await ballotContract.votingPower() as unknown as number;
  // console.log(Number(votingPowerAvailable))
  if (votingPowerAvailable < votingAmount) throw new Error( "Has not enough voting power")
   

  const voteTx = await ballotContract.vote(indexToVote, votingAmount);
  await voteTx.wait();
  const proposalVote = await ballotContract.proposals(indexToVote);
  console.log(`Transaction completed. Hash: ${voteTx.hash}`);

  console.log(`vote completed for propsosal ${proposalVote}`);
}
async function main() {
  if (process.argv.length < 3) throw new Error("ballot address missing");
  if (process.argv.length < 4) throw new Error(" include vote amount");
  if (process.argv.length < 5) throw new Error("No prososal selected");

  const ballotAddress = process.argv[2];
  const votingAmount = Number(process.argv[3]);
  const indexToVote = Number(process.argv[4]);
  const signer = await wallet();
  await vote(signer, ballotAddress, votingAmount, indexToVote);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function setupProvider() {
  const infuraOptions = process.env.INFURA_API_KEY
    ? process.env.INFURA_API_SECRET
      ? {
          projectId: process.env.INFURA_API_KEY,
          projectSecret: process.env.INFURA_API_SECRET,
        }
      : process.env.INFURA_API_KEY
    : "";
  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: infuraOptions,
  };
  const provider = ethers.providers.getDefaultProvider("ropsten", options);
  return provider;
}

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

  const votingPowerAvailable =
    (await ballotContract.votingPower()) as unknown as number;
  // console.log(Number(votingPowerAvailable))
  if (votingPowerAvailable > votingAmount)
    throw new Error("Has not enough voting power");

  const voteTx = await ballotContract.vote(indexToVote, votingAmount);
  await voteTx.wait();
  const proposalVote = await ballotContract.proposals(indexToVote);
  console.log(`Transaction completed. Hash: ${voteTx.hash}`);

  console.log(`vote completed for propsosal ${proposalVote}`);
}
async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  if (process.argv.length < 3) throw new Error("ballot address missing");
  if (process.argv.length < 4) throw new Error(" include vote amount");
  if (process.argv.length < 5) throw new Error("No prososal selected");

  const ballotAddress = process.argv[2];
  const votingAmount = Number(process.argv[3]);
  const indexToVote = Number(process.argv[4]);

  await vote(signer, ballotAddress, votingAmount, indexToVote);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
